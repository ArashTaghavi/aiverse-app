<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class AuthController extends Controller
{
    public function show(): Response
    {
        return Inertia::render('auth/index');
    }
}
