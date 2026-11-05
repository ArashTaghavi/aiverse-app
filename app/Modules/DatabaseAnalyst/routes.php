<?php

use App\Modules\DatabaseAnalyst\Controllers\DatabaseAnalystController;
use Illuminate\Support\Facades\Route;

Route::prefix('/database-analyst')
    ->name('chat-with-document.')
    ->controller(DatabaseAnalystController::class)
    ->group(function () {
        Route::get('/', 'index')->name('index');

        Route::post('/upload', 'upload')->name('upload');
    });
