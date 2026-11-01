<?php

use App\Http\Controllers\SiteController;
use Illuminate\Support\Facades\Route;

Route::get('/', [SiteController::class, 'index'])->name('home');

Route::get('/portfolio', [SiteController::class, 'portfolio'])->name('portfolio');
