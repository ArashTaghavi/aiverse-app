<?php

namespace App\Modules\DatabaseAnalyst\Enums;

use App\Modules\DatabaseAnalyst\Module;

enum RouteEnum: string
{
    case Ingest = Module::ROUTE_PREFIX.'/ingest';
    case Ask = Module::ROUTE_PREFIX.'/ask';

}
