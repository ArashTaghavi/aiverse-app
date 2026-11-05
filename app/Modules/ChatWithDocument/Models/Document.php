<?php

namespace App\Modules\ChatWithDocument\Models;

use App\Modules\Base\Enums\EmbeddingStatusEnum;
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
    'last_message',
    'embedding_status',
    'embedding_error',
])]
class Document extends Model
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

    public function documentChatTurns(): HasMany
    {
        return $this->hasMany(related: DocumentChatTurn::class, foreignKey: 'document_id');
    }
}
