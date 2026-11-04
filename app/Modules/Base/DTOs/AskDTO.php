<?php

namespace App\Modules\Base\DTOs;

use Illuminate\Support\Str;
use InvalidArgumentException;

final readonly class AskDTO
{
    private string $entityKey;

    private int $entityId;

    public function __construct(
        public int $ownerId,
        public string $question,
        int ...$entityId,
    ) {
        if (count($entityId) !== 1 || ! str_ends_with(array_key_first($entityId), 'Id')) {
            throw new InvalidArgumentException('Exactly one entity ID is required.');
        }

        $this->entityKey = Str::snake(array_key_first($entityId));
        $this->entityId = reset($entityId);
    }

    public function toArray(): array
    {
        return [
            $this->entityKey => $this->entityId,
            'owner_id' => $this->ownerId,
            'question' => $this->question,
        ];
    }
}
