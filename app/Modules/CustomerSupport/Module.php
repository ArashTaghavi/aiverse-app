<?php

namespace App\Modules\CustomerSupport;

final class Module
{
    public const NAME = 'customer-support';

    public const TITLE = 'Customer Support';

    public const DESCRIPTION = 'Customer Support';

    public const VERSION = '1.0.0';

    public const ROUTE_PREFIX = self::NAME;

    public const CHANNEL_PREFIX = self::NAME.'.users';
}
