<?php

namespace App\Modules\Base\Enums;

enum AnswerStatusEnum: string
{
    case Pending = 'PENDING';
    case Processing = 'PROCESSING';
    case Completed = 'COMPLETED';
    case Failed = 'FAILED';
}
