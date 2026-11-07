<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class SiteController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Pages/Site/Index');
    }

    public function portfolio(): Response
    {
        return Inertia::render('Pages/Site/Portfolio/Index');
    }
}
