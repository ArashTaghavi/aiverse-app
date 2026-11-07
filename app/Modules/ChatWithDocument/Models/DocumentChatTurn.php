<?php

namespace App\Modules\ChatWithDocument\Models;

use App\Modules\Base\Enums\ProcessingStatusEnum;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** @property ProcessingStatusEnum $answer_status */
#[Fillable([
    'question',
    'answer',
    'answer_status',
    'answer_error',
])]
class DocumentChatTurn extends Model
{
    public function casts(): array
    {
        return [
            'document_id' => 'integer',
            'answer_status' => ProcessingStatusEnum::class,
        ];
    }

    /** @return BelongsTo<Document, $this> */
    public function document(): BelongsTo
    {
        return $this->belongsTo(related: Document::class);
    }

    public function markAsProcessing(): void
    {
        $this->update([
            'answer_status' => ProcessingStatusEnum::Processing,
        ]);
    }

    public function markAsCompleted(string $answer): void
    {
        $this->update([
            'answer_status' => ProcessingStatusEnum::Completed,
            'answer' => $answer,
        ]);
    }

    public function markAsFailed(?string $error = ''): void
    {
        $this->update([
            'answer_status' => ProcessingStatusEnum::Failed,
            'answer_error' => $error,
        ]);
    }
}
