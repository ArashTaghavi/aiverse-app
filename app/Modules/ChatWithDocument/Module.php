<?php

namespace App\Modules\ChatWithDocument;

final class Module
{
    public const NAME = 'chat-with-document';

    public const TITLE = 'Chat with Document';

    public const DESCRIPTION = 'Chat with your documents using AI.';

    public const VERSION = '1.0.0';

    public const ROUTE_PREFIX = self::NAME;

    public const CHANNEL_PREFIX = self::NAME.'users';
}
