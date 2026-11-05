<?php

namespace App\Modules\ChatWithDocument\DTOs;

final readonly class IngestDTO
{
    public function __construct(public string $filePath, public int $documentId, public int $ownerId) {}

    /** @return array{file_path: string, document_id: int, owner_id: int} */
    public function toArray(): array
    {
        return [
            'file_path' => $this->filePath,
            'document_id' => $this->documentId,
            'owner_id' => $this->ownerId,
        ];
    }
}
