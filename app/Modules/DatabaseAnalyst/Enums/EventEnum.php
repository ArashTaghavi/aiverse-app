<?php

namespace App\Modules\DatabaseAnalyst\Enums;

use App\Modules\DatabaseAnalyst\Module;

enum EventEnum: string
{
    case UploadProgress = Module::NAME.'.upload.progress';

    case EmbeddingCompleted = Module::NAME.'.embedding.completed';

    case EmbeddingFailed = Module::NAME.'.embedding.failed';

    case AnswerCompleted = Module::NAME.'.answer.completed';

    case AnswerFailed = Module::NAME.'.answer.failed';
}
