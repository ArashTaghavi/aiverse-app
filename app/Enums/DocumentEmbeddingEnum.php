<?php

namespace App\Enums;

enum DocumentEmbeddingEnum: string
{
    case Pending = 'PENDING';
    case Processing = 'PROCESSING';
    case Completed = 'COMPLETED';
    case Failed = 'FAILED';
}
