<?php

namespace App\Models\ChatWithDocument;

use App\Enums\DocumentEmbeddingEnum;
use App\Models\User;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
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
    use SoftDeletes;

    public function casts(): array
    {
        return [
            'owner_id' => 'integer',
            'size' => 'integer',
            'embedding_status' => DocumentEmbeddingEnum::class,
        ];
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class);
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
}
