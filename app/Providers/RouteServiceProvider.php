<?php

namespace App\Providers;

use App\Models\ChatWithDocument\Document;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class RouteServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Route::bind('relatedDocument', function (int $value) {
            return Document::where('owner_id', auth()->id())
                ->whereKey($value)
                ->firstOrFail();
        });
    }
}
