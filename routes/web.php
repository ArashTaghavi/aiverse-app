<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\SiteController;
use App\Http\Controllers\User\ChatWithDocumentController;
use Illuminate\Support\Facades\Route;

Route::get('/', [SiteController::class, 'index'])->name('home');

Route::get('/portfolio', [SiteController::class, 'portfolio'])->name('portfolio');

Route::middleware('guest')->get('/auth', [AuthController::class, 'show'])->name('auth');


Route::prefix('chat-with-document')->group(function () {
    Route::post('/upload', [ChatWithDocumentController::class, 'upload']);
});
