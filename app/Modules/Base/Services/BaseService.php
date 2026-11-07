<?php

namespace App\Modules\Base\Services;

use App\Models\User;
use App\Services\StorageService;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\UploadedFile;

abstract class BaseService
{
    public function __construct(protected StorageService $storageService) {}

    abstract protected function model(): string;

    abstract protected function relation(): string;

    abstract protected function embeddingStatusEnum(): string;

    abstract protected function uploadProgressEvent(): string;

    abstract protected function embeddingRequestedEvent(): string;

    abstract protected function askJob(): string;

    abstract protected function chatTurnRelation(): string;

    public function documents(User $user): Collection
    {
        return $user->{$this->relation()}()->latest('id')->get();
    }

    public function upload(UploadedFile $file, string $title, int $ownerId): Model
    {
        $model = $this->model();
        $status = $this->embeddingStatusEnum();
        $progressEvent = $this->uploadProgressEvent();
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
}
