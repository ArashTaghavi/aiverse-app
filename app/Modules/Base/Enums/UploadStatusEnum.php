<?php

namespace App\Modules\Base\Enums;

enum UploadStatusEnum: string
{
    case Pending = 'pending';
    case Processing = 'processing';
    case Completed = 'completed';
    case Failed = 'failed';
}
