<?php

namespace App\Modules\ChatWithDocument\Enums;

enum EventEnum: string
{
    case UPLOAD_PROGRESS = 'chat-with-document.upload.progress';

    case EMBEDDING_COMPLETED = 'chat-with-document.embedding.completed';

    case EMBEDDING_FAILED = 'chat-with-document.embedding.failed';

    case ANSWER_COMPLETED = 'chat-with-document.answer.completed';

    case ANSWER_FAILED = 'chat-with-document.answer.failed';
}
