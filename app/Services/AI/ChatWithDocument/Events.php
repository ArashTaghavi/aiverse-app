<?php

namespace App\Services\AI\ChatWithDocument;

final class Events
{
    public const EMBEDDING_COMPLETED = 'chat-with-document.embedding.completed';

    public const EMBEDDING_FAILED = 'chat-with-document.embedding.failed';

    public const ANSWER_COMPLETED = 'chat-with-document.answer.completed';

    public const ANSWER_FAILED = 'chat-with-document.answer.failed';
}
