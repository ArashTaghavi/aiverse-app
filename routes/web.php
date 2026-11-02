<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\SiteController;
use App\Http\Controllers\User\ChatWithDocumentController;
use App\Http\Controllers\User\UserPanelController;
use App\Services\AI\AIClient;
use Illuminate\Support\Facades\Route;

Route::get('/', [SiteController::class, 'index'])->name('home');

Route::get('/portfolio', [SiteController::class, 'portfolio'])->name('portfolio');

Route::middleware('guest')->get('/auth', [AuthController::class, 'show'])->name('auth');

Route::middleware('auth')
    ->prefix('/user')
    ->name('user.')
    ->group(function () {
        Route::get('/', [UserPanelController::class, 'index'])->name('user.index');

        Route::prefix('/chat-with-document')
            ->name('chat-with-document.')
            ->controller(ChatWithDocumentController::class)
            ->group(function () {
                Route::get('/', 'index')->name('index');
                Route::get('/documents', 'documents')->name('documents');

                Route::post('/upload', 'upload')->name('upload');
                Route::post('/ask', 'ask')->name('ask');
            });

    });
Route::get('/xx', function () {
    $client = new AIClient;

    return $client->post('chat-with-document/ask', ['document_id' => 3, 'owner_id' => 1, 'question' => 'سلام']);

});
