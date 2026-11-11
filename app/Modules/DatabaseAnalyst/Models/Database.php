<?php

namespace App\Modules\DatabaseAnalyst\Models;

use App\Modules\Base\Enums\ProcessingStatusEnum;
use App\Modules\Base\Traits\HasEmbeddableFile;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'owner_id',
    'title',
    'original_name',
    'storage_path',
    'mime_type',
    'extension',
    'size',
    'connection',
    'database_schema',
    'container_provisioning_status',
    'container_provisioning_error',
    'embedding_status',
    'embedding_error',
    'last_message',
])]
class Database extends Model
{
    use HasEmbeddableFile;

    public static function uploadPath(): string
    {
        return 'database-analysts';
    }

    protected function embeddingStatusEnum(): string
    {
        return ProcessingStatusEnum::class;
    }

    public function casts(): array
    {
        return [
            'owner_id' => 'integer',
            'size' => 'integer',
            'connection' => 'array',
            'embedding_status' => $this->embeddingStatusEnum(),
        ];
    }

    public function databaseChatTurns(): HasMany
    {
        return $this->hasMany(DatabaseChatTurn::class);
    }

    public function updateConnection(array $connection)
    {
        $this->update(['connection' => $connection]);
    }
}
