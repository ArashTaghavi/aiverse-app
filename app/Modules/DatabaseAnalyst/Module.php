<?php

namespace App\Modules\DatabaseAnalyst;

final class Module
{
    public const NAME = 'database-analyst';

    public const TITLE = 'Database Analyst';

    public const DESCRIPTION = 'Analyze your databases using AI. Ask questions in natural language, generate SQL queries, and explore your data.';

    public const VERSION = '1.0.0';

    public const ROUTE_PREFIX = self::NAME;

    public const CHANNEL_PREFIX = self::NAME.'.users';
}
