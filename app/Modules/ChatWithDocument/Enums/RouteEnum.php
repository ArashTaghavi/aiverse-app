<?php

namespace App\Modules\ChatWithDocument\Enums;

use App\Modules\ChatWithDocument\Module;

enum RouteEnum: string
{
    case Ingest = Module::ROUTE_PREFIX.'/ingest';
    case Ask = Module::ROUTE_PREFIX.'/ask';

}
