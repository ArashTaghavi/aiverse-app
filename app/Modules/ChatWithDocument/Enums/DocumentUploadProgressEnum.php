<?php

namespace App\Modules\ChatWithDocument\Enums;

enum DocumentUploadProgressEnum: string
{
    case Upload = 'UPLOAD';
    case Embedding = 'EMBEDDING';
    case Result = 'RESULT';
}
