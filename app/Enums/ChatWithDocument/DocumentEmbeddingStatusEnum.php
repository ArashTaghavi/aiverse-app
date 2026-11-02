<?php

namespace App\Enums\ChatWithDocument;

enum DocumentEmbeddingStatusEnum: string
{
    case Pending = 'PENDING';
    case Processing = 'PROCESSING';
    case Completed = 'COMPLETED';
    case Failed = 'FAILED';
}
