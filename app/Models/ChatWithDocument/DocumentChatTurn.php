<?php

namespace App\Models\ChatWithDocument;

use App\Enums\ChatWithDocument\AnswerStatusEnum;
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
}
