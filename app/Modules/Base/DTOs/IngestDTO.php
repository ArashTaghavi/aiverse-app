<?php

namespace App\Modules\Base\DTOs;

use Illuminate\Support\Str;
use InvalidArgumentException;

final readonly class IngestDTO
{
    private string $entityKey;

    private int $entityId;

    public function __construct(
        public string $filePath,
        public int $ownerId,
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
            'file_path' => $this->filePath,
            'owner_id' => $this->ownerId,
            $this->entityKey => $this->entityId,
        ];
    }
}
