<?php

use App\Models\User;
use App\Modules\CustomerSupport\Controllers\CustomerSupportController;
use App\Modules\CustomerSupport\Models\ProductCategory;
use Illuminate\Database\Events\QueryExecuted;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;

test('loads the tabs page without querying or including products', function () {
    $user = User::factory()->create();
    $productQueries = [];

    DB::listen(function (QueryExecuted $query) use (&$productQueries): void {
        if (preg_match('/\bproducts\b/i', $query->sql)) {
            $productQueries[] = $query->sql;
        }
    });

    $this->actingAs($user)->get(action([CustomerSupportController::class, 'index']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Modules/CustomerSupport/Pages/Index', false)
            ->missing('products'));

    expect($productQueries)->toBeEmpty();
});

test('includes products and their categories when explicitly requested in a partial reload', function () {
    $user = User::factory()->create();
    $category = ProductCategory::create(['title' => 'Accessories']);
    $category->products()->create(['title' => 'Keyboard', 'price' => 1000, 'stock' => 5]);

    $initialResponse = $this->actingAs($user)->get(action([CustomerSupportController::class, 'index']));

    $this->actingAs($user)->withHeaders([
        'X-Inertia' => 'true',
        'X-Inertia-Version' => $initialResponse->viewData('page')['version'],
        'X-Inertia-Partial-Component' => 'Modules/CustomerSupport/Pages/Index',
        'X-Inertia-Partial-Data' => 'products',
    ])->get(action([CustomerSupportController::class, 'index']))
        ->assertOk()
        ->assertJsonCount(1, 'props.products')
        ->assertJsonPath('props.products.0.title', 'Keyboard')
        ->assertJsonPath('props.products.0.product_category.id', $category->id);
});

test('fetches paginated products with categories from the separate endpoint', function () {
    $user = User::factory()->create();
    $category = ProductCategory::create(['title' => 'Accessories']);

    for ($index = 1; $index <= 16; $index++) {
        $category->products()->create(['title' => "Product {$index}", 'price' => 1000, 'stock' => 5]);
    }

    $deletedProduct = $category->products()->create(['title' => 'Deleted product', 'price' => 1000]);
    $deletedProduct->delete();

    $this->actingAs($user)->getJson(route('user.customer-support.products.index'))
        ->assertOk()
        ->assertJsonCount(15, 'data')
        ->assertJsonPath('data.0.title', 'Product 1')
        ->assertJsonPath('data.0.product_category.id', $category->id)
        ->assertJsonPath('meta.total', 16);

    $this->getJson(route('user.customer-support.products.index', ['page' => 2]))
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.title', 'Product 16')
        ->assertJsonPath('meta.current_page', 2);
});

test('returns an empty products collection when there are no products', function () {
    $this->actingAs(User::factory()->create())
        ->getJson(route('user.customer-support.products.index'))
        ->assertOk()
        ->assertJsonCount(0, 'data')
        ->assertJsonPath('meta.total', 0);
});
