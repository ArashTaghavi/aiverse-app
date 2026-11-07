<?php

namespace App\Modules\ChatWithDocument\Models;

use App\Modules\Base\Enums\ProcessingStatusEnum;
use App\Modules\Base\Traits\HasEmbeddableFile;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property ProcessingStatusEnum $embedding_status
 * @property-read string $absolute_path
 * @property-read string $human_size
 */
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
        return 'chat-with-document';
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
            'embedding_status' => ProcessingStatusEnum::class,
        ];
    }

    /** @return HasMany<DocumentChatTurn, $this> */
    public function documentChatTurns(): HasMany
    {
        return $this->hasMany(related: DocumentChatTurn::class, foreignKey: 'document_id');
    }
}
