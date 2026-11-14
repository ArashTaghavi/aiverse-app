<?php

namespace App\Modules\CustomerSupport\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\CustomerSupport\Models\Product;
use App\Modules\CustomerSupport\Resources\ProductResource;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerSupportController extends Controller
{
    public function index(Request $request): Response
    {
        $validated = $request->validate([
            'name' => ['nullable', 'string', 'max:255'],
        ]);

        $name = trim($validated['name'] ?? '');

        return Inertia::render('Modules/CustomerSupport/Pages/Index', [
            'products' => Inertia::optional(
                fn () => ProductResource::collection(Product::with('productCategory')
                    ->when($name !== '', fn ($query) => $query->where('title', 'like', "%{$name}%"))
                    ->paginate())->resolve()
            ),
        ]);
    }
}
