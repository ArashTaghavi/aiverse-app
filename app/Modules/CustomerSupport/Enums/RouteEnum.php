<?php

namespace App\Modules\CustomerSupport\Enums;

use App\Modules\CustomerSupport\Module;

enum RouteEnum: string
{
    case Ask = Module::ROUTE_PREFIX.'/ask';

}
