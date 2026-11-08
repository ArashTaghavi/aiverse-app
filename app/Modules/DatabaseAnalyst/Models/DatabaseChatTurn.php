<?php

namespace App\Modules\DatabaseAnalyst\Models;

use App\Modules\Base\Enums\ProcessingStatusEnum;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'question',
    'answer',
    'answer_status',
    'answer_error',
])]
class DatabaseChatTurn extends Model
{
    public function casts(): array
    {
        return [
            'database_id' => 'integer',
            'answer_status' => ProcessingStatusEnum::class,
        ];
    }

    public function database(): BelongsTo
    {
        return $this->belongsTo(related: Database::class);
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
