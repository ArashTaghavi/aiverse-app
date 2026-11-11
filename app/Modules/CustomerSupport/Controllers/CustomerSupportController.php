<?php

namespace App\Modules\CustomerSupport\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\CustomerSupport\Services\CustomerSupportService;

class CustomerSupportController extends Controller
{
    public function __construct(private CustomerSupportService $service) {}
}
