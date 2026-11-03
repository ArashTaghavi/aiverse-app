<?php

namespace App\Enums\ChatWithDocument;

enum DocumentUploadProgressEnum: string
{
    case Upload = 'UPLOAD';
    case Embedding = 'EMBEDDING';
    case Result = 'RESULT';
}
