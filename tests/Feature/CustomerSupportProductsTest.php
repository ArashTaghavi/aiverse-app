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
        ->assertJsonCount(1, 'props.products.data')
        ->assertJsonPath('props.products.data.0.title', 'Keyboard')
        ->assertJsonPath('props.products.data.0.product_category.id', $category->id);
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

test('sorts searched products by price on the server', function (string $direction, array $expectedPrices) {
    $user = User::factory()->create();
    $category = ProductCategory::create(['title' => 'Accessories']);

    foreach ([3000, 1000, 2000] as $price) {
        $category->products()->create(['title' => 'Keyboard', 'price' => $price]);
    }

    $category->products()->create(['title' => 'Mouse', 'price' => 500]);
    $initialResponse = $this->actingAs($user)->get(action([CustomerSupportController::class, 'index']));

    $this->withHeaders([
        'X-Inertia' => 'true',
        'X-Inertia-Version' => $initialResponse->viewData('page')['version'],
        'X-Inertia-Partial-Component' => 'Modules/CustomerSupport/Pages/Index',
        'X-Inertia-Partial-Data' => 'products',
    ])->get(action([CustomerSupportController::class, 'index'], ['name' => 'Keyboard', 'sort' => $direction]))
        ->assertOk()
        ->assertJsonCount(3, 'props.products.data')
        ->assertJsonPath('props.products.data.0.price', $expectedPrices[0])
        ->assertJsonPath('props.products.data.1.price', $expectedPrices[1])
        ->assertJsonPath('props.products.data.2.price', $expectedPrices[2]);
})->with([
    'ascending' => ['asc', [1000, 2000, 3000]],
    'descending' => ['desc', [3000, 2000, 1000]],
]);

test('rejects unsupported price sort directions', function () {
    $this->actingAs(User::factory()->create())
        ->getJson(action([CustomerSupportController::class, 'index'], ['sort' => 'invalid']))
        ->assertUnprocessable()
        ->assertJsonValidationErrors('sort');
});

test('paginates products using the selected page size', function (int $perPage) {
    $category = ProductCategory::create(['title' => 'Accessories']);

    for ($index = 1; $index <= 101; $index++) {
        $category->products()->create(['title' => "Keyboard {$index}", 'price' => $index * 100]);
    }

    $initialResponse = $this->actingAs(User::factory()->create())
        ->get(action([CustomerSupportController::class, 'index']));

    $this->withHeaders([
        'X-Inertia' => 'true',
        'X-Inertia-Version' => $initialResponse->viewData('page')['version'],
        'X-Inertia-Partial-Component' => 'Modules/CustomerSupport/Pages/Index',
        'X-Inertia-Partial-Data' => 'products',
    ])->get(action([CustomerSupportController::class, 'index'], ['per_page' => $perPage]))
        ->assertOk()
        ->assertJsonCount($perPage, 'props.products.data')
        ->assertJsonPath('props.products.meta.per_page', $perPage)
        ->assertJsonPath('props.products.meta.total', 101);
})->with([10, 20, 50, 100]);

test('preserves search and price sorting when moving between pages', function () {
    $category = ProductCategory::create(['title' => 'Accessories']);

    for ($index = 1; $index <= 21; $index++) {
        $category->products()->create(['title' => "Keyboard {$index}", 'price' => $index * 100]);
    }

    $category->products()->create(['title' => 'Mouse', 'price' => 9999]);
    $initialResponse = $this->actingAs(User::factory()->create())
        ->get(action([CustomerSupportController::class, 'index']));

    $this->withHeaders([
        'X-Inertia' => 'true',
        'X-Inertia-Version' => $initialResponse->viewData('page')['version'],
        'X-Inertia-Partial-Component' => 'Modules/CustomerSupport/Pages/Index',
        'X-Inertia-Partial-Data' => 'products',
    ])->get(action([CustomerSupportController::class, 'index'], [
        'name' => 'Keyboard', 'sort' => 'desc', 'per_page' => 10, 'page' => 2,
    ]))
        ->assertOk()
        ->assertJsonCount(10, 'props.products.data')
        ->assertJsonPath('props.products.data.0.price', 1100)
        ->assertJsonPath('props.products.data.9.price', 200)
        ->assertJsonPath('props.products.meta.current_page', 2)
        ->assertJsonPath('props.products.meta.total', 21);
});

test('rejects invalid pagination parameters', function (array $query, string $field) {
    $this->actingAs(User::factory()->create())
        ->getJson(action([CustomerSupportController::class, 'index'], $query))
        ->assertUnprocessable()
        ->assertJsonValidationErrors($field);
})->with([
    'unsupported page size' => [['per_page' => 25], 'per_page'],
    'invalid page' => [['page' => 0], 'page'],
]);
