<?php

namespace App\Modules\ChatWithDocument\Enums;

enum DocumentEmbeddingStatusEnum: string
{
    case Pending = 'PENDING';
    case Processing = 'PROCESSING';
    case Completed = 'COMPLETED';
    case Failed = 'FAILED';
}
