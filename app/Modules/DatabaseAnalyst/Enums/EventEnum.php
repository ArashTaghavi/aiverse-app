<?php

namespace App\Modules\DatabaseAnalyst\Enums;

use App\Modules\DatabaseAnalyst\Module;

enum EventEnum: string
{
    case UPLOAD_PROGRESS = Module::NAME.'.upload.progress';

    case EMBEDDING_COMPLETED = Module::NAME.'.embedding.completed';

    case EMBEDDING_FAILED = Module::NAME.'.embedding.failed';

    case ANSWER_COMPLETED = Module::NAME.'.answer.completed';

    case ANSWER_FAILED = Module::NAME.'.answer.failed';
}
