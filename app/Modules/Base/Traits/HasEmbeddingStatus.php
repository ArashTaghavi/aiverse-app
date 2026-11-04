<?php

namespace App\Modules\Base\Traits;

trait HasEmbeddingStatus
{
    abstract protected function embeddingStatusEnum(): string;

    public function markAsProcessing(): void
    {
        $enum = $this->embeddingStatusEnum();

        $this->update([
            'embedding_status' => $enum::Processing,
        ]);
    }

    public function markAsCompleted(): void
    {
        $enum = $this->embeddingStatusEnum();

        $this->update([
            'embedding_status' => $enum::Completed,
            'embedding_error' => null,
        ]);
    }

    public function markAsFailed(?string $error): void
    {
        $enum = $this->embeddingStatusEnum();

        $this->update([
            'embedding_status' => $enum::Failed,
            'embedding_error' => $error,
        ]);
    }
}
