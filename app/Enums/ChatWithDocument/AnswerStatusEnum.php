<?php

namespace App\Enums\ChatWithDocument;

enum AnswerStatusEnum: string
{
    case Pending = 'PENDING';
    case Processing = 'PROCESSING';
    case Completed = 'COMPLETED';
    case Failed = 'FAILED';
}
