<?php

use App\Modules\ChatWithDocument\Controllers\ChatWithDocumentController;
use Illuminate\Support\Facades\Route;

Route::prefix('/chat-with-document')
    ->name('chat-with-document.')
    ->controller(ChatWithDocumentController::class)
    ->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/documents', 'documents')->name('documents');

        Route::post('/upload', 'upload')->name('upload');
        Route::post('/ask/{relatedDocument}', 'ask')->name('ask');
    });
