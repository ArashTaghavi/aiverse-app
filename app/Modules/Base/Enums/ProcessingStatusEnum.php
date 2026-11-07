<?php

namespace App\Modules\Base\Enums;

enum ProcessingStatusEnum: string
{
    case Pending = 'PENDING';
    case Processing = 'PROCESSING';
    case Completed = 'COMPLETED';
    case Failed = 'FAILED';
}
