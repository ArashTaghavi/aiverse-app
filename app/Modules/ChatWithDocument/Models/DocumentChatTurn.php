<?php

namespace App\Modules\ChatWithDocument\Models;

use App\Modules\ChatWithDocument\Enums\AnswerStatusEnum;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
            'answer_status' => AnswerStatusEnum::class,
        ];
    }

    public function document(): BelongsTo
    {
        return $this->belongsTo(related: Document::class);
    }

    public function markAsProcessing(): void
    {
        $this->update([
            'answer_status' => AnswerStatusEnum::Processing,
        ]);
    }

    public function markAsCompleted(string $answer): void
    {
        $this->update([
            'answer_status' => AnswerStatusEnum::Completed,
            'answer' => $answer,
        ]);
    }

    public function markAsFailed(?string $error = ''): void
    {
        $this->update([
            'answer_status' => AnswerStatusEnum::Failed,
            'answer_error' => $error,
        ]);
    }
}
