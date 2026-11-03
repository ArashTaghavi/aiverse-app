<?php

namespace App\Modules\ChatWithDocument\Models;

use App\Models\User;
use App\Modules\ChatWithDocument\Enums\DocumentEmbeddingStatusEnum;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

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
    use HasUuids,SoftDeletes;

    public const UPLOAD_PATH = 'chat-with-document';

    public function casts(): array
    {
        return [
            'owner_id' => 'integer',
            'size' => 'integer',
            'embedding_status' => DocumentEmbeddingStatusEnum::class,
        ];
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(related: User::class);
    }

    public function documentChatTurns(): HasMany
    {
        return $this->hasMany(related: DocumentChatTurn::class, foreignKey: 'document_id');
    }

    public function humanSize(): Attribute
    {
        $size = match (true) {
            $this->size < 1024 => $this->size.' Bytes',
            $this->size < 1024 ** 2 => round($this->size / 1024, 2).' KB',
            $this->size < 1024 ** 3 => round($this->size / (1024 ** 2), 2).' MB',
            default => round($this->size / 1024 ** 3, 2).' GB',
        };

        return Attribute::get(fn () => $size);
    }

    public function absolutePath(): Attribute
    {
        return Attribute::get(
            fn () => Storage::disk('public')->path($this->storage_path)
        );
    }

    public function markAsProcessing(): void
    {
        $this->update([
            'embedding_status' => DocumentEmbeddingStatusEnum::Processing,
        ]);
    }

    public function markAsCompleted(): void
    {
        $this->update([
            'embedding_status' => DocumentEmbeddingStatusEnum::Completed,
        ]);
    }

    public function markAsFailed(?string $error): void
    {
        $this->update([
            'embedding_status' => DocumentEmbeddingStatusEnum::Failed,
            'embedding_error' => $error,
        ]);
    }
}
