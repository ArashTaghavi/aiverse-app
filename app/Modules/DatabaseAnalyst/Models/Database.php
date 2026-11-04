<?php

namespace App\Modules\DatabaseAnalyst\Models;

use App\Modules\Base\Enums\EmbeddingStatusEnum;
use App\Modules\Base\Traits\HasEmbeddableFile;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'owner_id',
    'title',
    'original_name',
    'storage_path',
    'mime_type',
    'extension',
    'size',
    'container_id',
    'container_name',
    'database_name',
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
        return EmbeddingStatusEnum::class;
    }

    public function casts(): array
    {
        return [
            'owner_id' => 'integer',
            'size' => 'integer',
            'embedding_status' => $this->embeddingStatusEnum(),
        ];
    }
}
