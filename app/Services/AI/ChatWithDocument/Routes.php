<?php

namespace App\Services\AI\ChatWithDocument;

final class Routes
{
    private const string PREFIX = 'chat-with-document/';

    public const string INGEST = self::PREFIX.'ingest';

    public const string ASK = self::PREFIX.'ask';
}
