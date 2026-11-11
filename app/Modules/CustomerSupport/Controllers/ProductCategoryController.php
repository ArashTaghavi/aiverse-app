<?php

namespace App\Modules\CustomerSupport\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\CustomerSupport\Models\ProductCategory;
use App\Modules\CustomerSupport\Resources\ProductCategoryResource;
use Illuminate\Http\Request;

class ProductCategoryController extends Controller
{
    public function index()
    {
        return ProductCategoryResource::collection(ProductCategory::paginate());
    }

    public function get(ProductCategory $productCategory)
    {
        return new ProductCategoryResource($productCategory);
    }

    public function store(Request $request)
    {
        ProductCategory::create([
            'title' => $request->input('title'),
        ]);

        return [
            'message' => 'success',
        ];
    }

    public function update(ProductCategory $productCategory, Request $request)
    {
        $productCategory->update(['title' => $request->input('title')]);

        return [
            'message' => 'success',
        ];
    }

    public function destroy(ProductCategory $productCategory)
    {
        $productCategory->delete();

        return [
            'message' => 'success',
        ];
    }
}
