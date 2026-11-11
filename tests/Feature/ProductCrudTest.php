<?php

use App\Models\User;
use App\Modules\CustomerSupport\Models\Product;
use App\Modules\CustomerSupport\Models\ProductCategory;

function productCrudFixture(): Product
{
    $category = ProductCategory::create(['title' => fake()->unique()->word()]);

    return Product::create([
        'title' => 'Test product',
        'description' => 'Product description',
        'price' => 150000,
        'stock' => 5,
        'product_category_id' => $category->id,
        'image' => 'products/test.jpg',
    ]);
}

test('lists products with their categories and excludes deleted products', function () {
    $owner = User::factory()->create();
    $product = productCrudFixture();
    $deleted = productCrudFixture();
    $deleted->delete();

    $this->actingAs($owner)->getJson(route('user.customer-support.products.index'))
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $product->id)
        ->assertJsonPath('data.0.product_category.id', $product->product_category_id);
});

test('gets a product and handles a deleted category', function () {
    $owner = User::factory()->create();
    $product = productCrudFixture();
    $product->productCategory->delete();

    $this->actingAs($owner)->getJson(route('user.customer-support.products.get', $product))
        ->assertOk()
        ->assertJsonPath('data.title', 'Test product')
        ->assertJsonPath('data.product_category.id', null)
        ->assertJsonPath('data.product_category.title', null);
});

test('creates a product using validated attributes and the default stock', function () {
    $owner = User::factory()->create();
    $category = ProductCategory::create(['title' => 'Electronics']);

    $this->actingAs($owner)->postJson(route('user.customer-support.products.store'), [
        'title' => 'Keyboard', 'price' => 100000, 'product_category_id' => $category->id,
        'deleted_at' => '2026-01-01',
    ])->assertOk()->assertExactJson(['message' => 'success']);

    $this->assertDatabaseHas('products', [
        'title' => 'Keyboard', 'price' => 100000, 'stock' => 1,
        'product_category_id' => $category->id, 'deleted_at' => null,
    ]);
});

test('partially updates a product including zero stock and nullable fields', function () {
    $owner = User::factory()->create();
    $product = productCrudFixture();

    $this->actingAs($owner)->patchJson(route('user.customer-support.products.update', $product), [
        'stock' => 0, 'description' => null, 'image' => null,
    ])->assertOk()->assertExactJson(['message' => 'success']);

    $this->assertDatabaseHas('products', [
        'id' => $product->id, 'stock' => 0, 'description' => null,
        'image' => null, 'price' => 150000, 'title' => 'Test product',
    ]);
});

test('rejects invalid product input without creating a product', function (array $changes, string $field) {
    $owner = User::factory()->create();
    $category = ProductCategory::create(['title' => 'Electronics']);
    $data = array_replace([
        'title' => 'Keyboard', 'price' => 100000, 'stock' => 5, 'product_category_id' => $category->id,
    ], $changes);

    $this->actingAs($owner)->postJson(route('user.customer-support.products.store'), $data)
        ->assertUnprocessable()->assertJsonValidationErrors($field);

    $this->assertDatabaseCount('products', 0);
})->with([
    'empty title' => [['title' => ''], 'title'],
    'negative price' => [['price' => -1], 'price'],
    'fractional price' => [['price' => 1.5], 'price'],
    'overflow price' => [['price' => 4294967296], 'price'],
    'negative stock' => [['stock' => -1], 'stock'],
    'overflow stock' => [['stock' => 65536], 'stock'],
    'unknown category' => [['product_category_id' => 99999], 'product_category_id'],
]);

test('rejects assigning a deleted category on update and preserves the product', function () {
    $owner = User::factory()->create();
    $product = productCrudFixture();
    $category = ProductCategory::create(['title' => 'Deleted category']);
    $category->delete();

    $this->actingAs($owner)->patchJson(route('user.customer-support.products.update', $product), [
        'product_category_id' => $category->id,
    ])->assertUnprocessable()->assertJsonValidationErrors('product_category_id');

    expect($product->fresh()->product_category_id)->toBe($product->product_category_id);
});

test('soft deletes a product', function () {
    $owner = User::factory()->create();
    $product = productCrudFixture();

    $this->actingAs($owner)->deleteJson(route('user.customer-support.products.destroy', $product))
        ->assertOk()->assertExactJson(['message' => 'success']);

    $this->assertSoftDeleted($product);
});

test('returns 404 when reading a deleted product', function () {
    $owner = User::factory()->create();
    $product = productCrudFixture();
    $product->delete();

    $this->actingAs($owner)->getJson(route('user.customer-support.products.get', $product))
        ->assertNotFound();
});

test('requires authentication for product management', function () {
    $this->postJson(route('user.customer-support.products.store'), [])
        ->assertUnauthorized();
});
