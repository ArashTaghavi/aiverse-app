<?php

namespace App\Modules\CustomerSupport\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\CustomerSupport\Models\Product;
use App\Modules\CustomerSupport\Resources\ProductResource;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerSupportController extends Controller
{
    public function index(Request $request): Response
    {
        $validated = $request->validate([
            'name' => ['nullable', 'string', 'max:255'],
            'sort' => ['nullable', 'in:asc,desc'],
            'per_page' => ['sometimes', 'integer', 'in:10,20,50,100'],
            'page' => ['sometimes', 'integer', 'min:1'],
        ]);

        $name = trim($validated['name'] ?? '');
        $sort = $validated['sort'] ?? null;
        $perPage = (int) ($validated['per_page'] ?? 10);

        return Inertia::render('Modules/CustomerSupport/Pages/Index', [
            'products' => Inertia::optional(
                fn () => ProductResource::collection(Product::with('productCategory')
                    ->when($name !== '', fn (Builder $query): Builder => $query->where('title', 'ilike', "%{$name}%"))
                    ->when($sort !== null, fn (Builder $query): Builder => $query->orderBy('price', $sort))
                    ->orderBy('id')
                    ->paginate($perPage)->withQueryString())
            ),
        ]);
    }
}
