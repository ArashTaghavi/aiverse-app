<?php

namespace App\Modules\Base\Services;

use App\Models\User;
use App\Modules\Base\DTOs\AskDTO;
use App\Modules\Base\Enums\ProcessingStatusEnum;
use App\Modules\Base\Enums\UploadProgressEnum;
use App\Services\AIClient;
use App\Services\StorageService;
use Generator;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Validation\ValidationException;
use Throwable;
use UnexpectedValueException;

abstract class BaseService
{
    public function __construct(protected StorageService $storageService, protected AIClient $aiClient) {}

    abstract protected function model(): string;

    abstract protected function embeddingRequestedEvent(): string;

    abstract protected function uploadProgressEvent(): string;

    abstract protected function userRelation(): string;

    abstract protected function chatTurnRelation(): string;

    abstract protected function chatTurnParentRelation(): string;

    abstract protected function answerCompletedEvent(): string;

    abstract protected function answerFailedEvent(): string;

    abstract protected function askRoute(): string;

    public function data(User $user)
    {
        return $user->{$this->userRelation()}()
            ->latest('id')
            ->simplePaginate(20, ['*'], 'page');
    }

    public function index(Request $request): array
    {
        $user = $request->user();

        $data = $this->data(user: $user);

        $uploadedRecordId = $request->session()->get('uploaded_record_id');
        $uploadedRecord = $uploadedRecordId ? $user->{$this->userRelation()}()->findOrFail($uploadedRecordId) : null;

        return [$data, $uploadedRecord];
    }

    public function show(Request $request, Model $relatedModel): array
    {
        $request->validate([
            'page' => ['nullable', 'integer', 'min:1'],
        ]);
        $user = $request->user();

        $chatTurnRelation = $this->chatTurnRelation();

        $data = $this->data(user: $user);

        $history = $relatedModel->{$chatTurnRelation}()
            ->orderBy('id')
            ->get();

        return [$data, $history];

    }

    public function upload(UploadedFile $file, string $title, int $ownerId): Model
    {
        $model = $this->model();
        $status = ProcessingStatusEnum::class;
        $uploadProgressEvent = $this->uploadProgressEvent();
        $embeddingRequestedEvent = $this->embeddingRequestedEvent();

        $uploaded = $this->storageService
            ->setBasePath($model::uploadPath()."/$ownerId")
            ->upload($file);

        $entity = $model::create([
            'owner_id' => $ownerId,
            'title' => $title,
            ...$uploaded,
            'embedding_status' => $status::Pending,
        ]);

        try {
            $uploadProgressEvent::dispatch(
                model: $entity,
                step: UploadProgressEnum::Upload->value,
                status: ProcessingStatusEnum::Completed->value,
            );
        } catch (Throwable $exception) {
            report($exception);
        }

        $embeddingRequestedEvent::dispatch(model: $entity);

        return $entity;
    }

    public function ask(Model $entity, string $question): Model
    {
        if ($entity->embedding_status !== ProcessingStatusEnum::Completed) {
            throw ValidationException::withMessages([
                'question' => 'The document is not ready for questions yet.',
            ]);
        }

        $entity->update(['last_message' => $question]);

        $chatTurn = $entity->{$this->chatTurnRelation()}()->create([
            'question' => $question,
            'answer_status' => ProcessingStatusEnum::Pending->value,
        ]);

        return $chatTurn;
    }

    public function streamAnswer(Model $chatTurn): Generator
    {
        $stream = null;
        $answer = '';
        $chatTurn->markAsProcessing();

        try {
            $entity = $chatTurn->{$this->chatTurnParentRelation()};
            $data = new AskDTO(
                $entity->owner_id,
                $chatTurn->question,
                ...[$this->chatTurnParentRelation().'Id' => $entity->getKey()],
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
            $entity->update(['last_message' => $answer]);
        } catch (Throwable $exception) {
            $chatTurn->markAsFailed(error: $exception->getMessage());
            $this->broadcastAnswerStatus($this->answerFailedEvent(), $chatTurn);

            throw $exception;
        } finally {
            $stream?->close();
        }

        $this->broadcastAnswerStatus($this->answerCompletedEvent(), $chatTurn);
    }

    private function broadcastAnswerStatus(string $eventClass, Model $chatTurn): void
    {
        try {
            event(new $eventClass($chatTurn));
        } catch (Throwable $exception) {
            report($exception);
        }
    }
}
