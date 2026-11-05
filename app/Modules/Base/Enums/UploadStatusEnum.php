<?php

namespace App\Modules\Base\Enums;

enum UploadStatusEnum: string
{
    case Pending = 'PENDING';
    case Processing = 'PROCESSING';
    case Completed = 'COMPLETED';
    case Failed = 'FAILED';
}
