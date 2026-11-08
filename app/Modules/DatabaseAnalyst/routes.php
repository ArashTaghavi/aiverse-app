<?php

use App\Modules\DatabaseAnalyst\Controllers\DatabaseAnalystController;
use Illuminate\Support\Facades\Route;

Route::prefix('/database-analyst')
    ->name('database-analyst.')
    ->controller(DatabaseAnalystController::class)
    ->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/databases/{relatedDatabase}', 'status')->name('status');

        Route::post('/upload', 'upload')->name('upload');
        Route::post('/ask/{relatedDatabase}', 'ask')->name('ask');
        Route::get('/{relatedDatabase}', 'show')->name('show');
    });
