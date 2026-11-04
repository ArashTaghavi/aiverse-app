<?php

namespace App\Modules\DatabaseAnalyst\Enums;

use App\Modules\ChatWithDocument\Module;

enum RouteEnum: string
{
    case INGEST = Module::ROUTE_PREFIX.'/ingest';
    case ASK = Module::ROUTE_PREFIX.'/ask';

}
