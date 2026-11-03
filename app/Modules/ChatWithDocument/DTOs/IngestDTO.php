<?php

namespace App\Modules\ChatWithDocument\DTOs;

final readonly class IngestDTO
{
    public function __construct(public string $filePath, public int $documentId, public int $ownerId) {}

    public function toArray(): array
    {
        return [
            'file_path' => $this->filePath,
            'document_id' => $this->documentId,
            'owner_id' => $this->ownerId,
        ];
    }
}
