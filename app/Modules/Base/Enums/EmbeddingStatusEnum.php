<?php

namespace App\Modules\Base\Enums;

enum EmbeddingStatusEnum: string
{
    case Pending = 'pending';
    case Processing = 'processing';
    case Completed = 'completed';
    case Failed = 'failed';
}
