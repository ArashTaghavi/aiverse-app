<?php

namespace App\Modules\Base\Enums;

enum UploadProgressEnum: string
{
    case Upload = 'UPLOAD';
    case Embedding = 'EMBEDDING';
    case Result = 'RESULT';
}
