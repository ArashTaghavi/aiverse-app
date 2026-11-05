<?php

namespace App\Modules\ChatWithDocument\DTOs;

final readonly class AskDTO
{
    public function __construct(public int $documentId, public int $ownerId, public string $question) {}

    /** @return array{document_id: int, owner_id: int, question: string} */
    public function toArray(): array
    {
        return [
            'document_id' => $this->documentId,
            'owner_id' => $this->ownerId,
            'question' => $this->question,
        ];
    }
}
