<?php

namespace App\Modules\Base\Services;

use App\Models\User;
use App\Modules\Base\DTOs\AskDTO;
use App\Modules\Base\Enums\ProcessingStatusEnum;
use App\Modules\Base\Events\BaseUploadProgress;
use App\Services\AIClient;
use App\Services\StorageService;
use Generator;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Throwable;
use UnexpectedValueException;

abstract class BaseService
{
    public function __construct(protected StorageService $storageService, protected AIClient $aiClient) {}

    abstract protected function model(): string;

    abstract protected function embeddingRequestedEvent(): string;

    abstract protected function userRelation(): string;

    abstract protected function askJob(): string;

    abstract protected function chatTurnRelation(): string;

    abstract protected function askRoute(): string;

    public function data(User $user)
    {
        return $user->{$this->userRelation()}->latest('id')->simplePaginate(20, ['*'], 'page');
    }

    public function index(Request $request): array
    {
        $user = $request->user();

        $data = $this->data(user: $user);

        $uploadedId = $request->session()->get('uploaded_database_id');
        $uploadedRecord = $uploadedId ? $user->{$this->userRelation()}()->findOrFail($uploadedId) : [];

        return [$data, $uploadedRecord];
    }

    public function show(Request $request, Model $relatedModel): array
    {
        $request->validate([
            'page' => ['nullable', 'integer', 'min:1'],
            'history_page' => ['nullable', 'integer', 'min:1'],
        ]);
        $user = $request->user();

        $chatTurnRelation = $this->chatTurnRelation();

        $data = $this->data(user: $user);

        $history = $relatedModel->{$chatTurnRelation}()
            ->latest('id')
            ->simplePaginate(30, ['*'], 'history_page');

        return [$data, $history];

    }

    public function upload(UploadedFile $file, string $title, int $ownerId): Model
    {
        $model = $this->model();
        $status = ProcessingStatusEnum::class;
        $progressEvent = BaseUploadProgress::class;
        $embeddingEvent = $this->embeddingRequestedEvent();

        $uploaded = $this->storageService
            ->setBasePath($model::uploadPath()."/$ownerId")
            ->upload($file);

        $entity = $model::create([
            'owner_id' => $ownerId,
            'title' => $title,
            ...$uploaded,
            'embedding_status' => $status::Pending,
        ]);

        $progressEvent::dispatch(
            model: $entity,
            step: 'upload',
            status: 'completed',
        );

        $embeddingEvent::dispatch(model: $entity);

        return $entity;
    }

    public function ask(Model $entity, string $question): Model
    {
        $entity->update(['last_message' => $question]);

        $turn = $entity->{$this->chatTurnRelation()}()->create([
            'question' => $question,
            'answer_status' => 'pending',
        ]);

        $job = $this->askJob();

        $job::dispatch(chatTurn: $turn);

        return $turn;
    }

    public function streamAnswer(Model $chatTurn): Generator
    {
        $stream = null;
        $answer = '';
        $chatTurn->markAsProcessing();

        try {
            $data = new AskDTO(
                documentId: $chatTurn->document_id,
                ownerId: $chatTurn->document->owner_id,
                question: $chatTurn->question,
            );
            $stream = $this->aiClient->streamPost($this->askRoute(), $data->toArray());

            while (! $stream->eof()) {
                $chunk = $stream->read(1024);

                if ($chunk === '') {
                    continue;
                }

                $answer .= $chunk;
                yield $chunk;
            }

            if (trim($answer) === '') {
                throw new UnexpectedValueException('The AI service returned an empty answer.');
            }

            $chatTurn->markAsCompleted(answer: $answer);
            $chatTurn->document->update(['last_message' => $answer]);
        } catch (Throwable $exception) {
            $chatTurn->markAsFailed(error: $exception->getMessage());

            throw $exception;
        } finally {
            $stream?->close();
        }
    }
}
