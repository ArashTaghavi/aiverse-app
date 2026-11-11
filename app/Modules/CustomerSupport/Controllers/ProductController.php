<?php

namespace App\Modules\CustomerSupport\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\CustomerSupport\Models\Product;
use App\Modules\CustomerSupport\Resources\ProductResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

class ProductController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return ProductResource::collection(Product::with('productCategory')->paginate());
    }

    public function get(Product $product): ProductResource
    {
        return new ProductResource($product->load('productCategory'));
    }

    public function store(Request $request): array
    {
        Product::create($this->validatedData($request));

        return ['message' => 'success'];
    }

    public function update(Product $product, Request $request): array
    {
        $product->update($this->validatedData($request, updating: true));

        return ['message' => 'success'];
    }

    public function destroy(Product $product): array
    {
        $product->delete();

        return ['message' => 'success'];
    }

    private function validatedData(Request $request, bool $updating = false): array
    {
        $presence = $updating ? 'sometimes' : 'required';

        return $request->validate([
            'title' => [$presence, 'required', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'price' => [$presence, 'required', 'integer', 'min:0', 'max:4294967295'],
            'stock' => ['sometimes', 'required', 'integer', 'min:0', 'max:65535'],
            'product_category_id' => [$presence, 'required', 'integer', Rule::exists('product_categories', 'id')->withoutTrashed()],
            'image' => ['sometimes', 'nullable', 'string', 'max:255'],
        ]);
    }
}
