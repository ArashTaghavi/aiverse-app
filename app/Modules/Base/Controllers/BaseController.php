<?php

namespace App\Modules\Base\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Base\Services\BaseService;

class BaseController extends Controller
{
    public function __construct(private BaseService $service) {}
}
