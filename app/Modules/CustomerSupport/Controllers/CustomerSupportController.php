<?php

namespace App\Modules\CustomerSupport\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\CustomerSupport\Models\Product;
use App\Modules\CustomerSupport\Resources\ProductResource;
use Inertia\Inertia;
use Inertia\Response;

class CustomerSupportController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Modules/CustomerSupport/Pages/Index', [
            'products' => Inertia::optional(
                fn () => ProductResource::collection(Product::with('productCategory')->paginate())->resolve()
            ),
        ]);
    }
}
