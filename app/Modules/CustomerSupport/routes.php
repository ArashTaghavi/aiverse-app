<?php

use App\Modules\CustomerSupport\Controllers\ProductController;
use Illuminate\Support\Facades\Route;

Route::prefix('customer-support/products')->name('customer-support.products.')
    ->controller(ProductController::class)->group(function () {
        Route::get('/', 'index')->name('index');
        Route::post('/', 'store')->name('store');
        Route::get('/{product}', 'get')->name('get');
        Route::match(['put', 'patch'], '/{product}', 'update')->name('update');
        Route::delete('/{product}', 'destroy')->name('destroy');
    });
