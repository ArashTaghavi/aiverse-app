<?php

use App\Models\User;
use App\Modules\CustomerSupport\Controllers\CustomerSupportController;
use App\Modules\CustomerSupport\Enums\OrderStatusEnum;
use App\Modules\CustomerSupport\Enums\PaymentMethodEnum;
use App\Modules\CustomerSupport\Enums\PaymentStatusEnum;
use App\Modules\CustomerSupport\Models\Order;
use App\Modules\CustomerSupport\Models\ProductCategory;
use Illuminate\Database\Events\QueryExecuted;
use Illuminate\Support\Facades\DB;
use Illuminate\Testing\TestResponse;
use Inertia\Testing\AssertableInertia as Assert;

/** @param array<string, mixed> $attributes */
function customerSupportOrderFixture(User $user, array $attributes = [], string $productTitle = 'Keyboard'): Order
{
    $category = ProductCategory::firstOrCreate(['title' => 'Accessories']);
    $product = $category->products()->create(['title' => $productTitle, 'price' => $attributes['total_amount'] ?? 3000, 'stock' => 5, 'image' => 'products/keyboard.jpg']);
    $order = $user->orders()->create(array_merge([
        'order_number' => fake()->unique()->uuid(),
        'total_amount' => 3000,
        'order_status' => OrderStatusEnum::Delivered,
        'payment_status' => PaymentStatusEnum::Paid,
        'shipping_address' => 'Test address',
        'paid_at' => now(),
    ], $attributes));
    $order->orderItems()->create(['product_id' => $product->id, 'quantity' => 1, 'unit_price' => $product->price, 'total_price' => $product->price]);
    $order->payments()->create(['amount' => $order->total_amount, 'status' => $order->payment_status, 'method' => PaymentMethodEnum::Online, 'failure_reason' => '']);

    return $order;
}

/** @param array<string, mixed> $query */
function customerSupportOrdersResponse(User $user, array $query = []): TestResponse
{
    $initial = test()->actingAs($user)->get(action([CustomerSupportController::class, 'index']));

    return test()->withHeaders([
        'X-Inertia' => 'true',
        'X-Inertia-Version' => $initial->viewData('page')['version'],
        'X-Inertia-Partial-Component' => 'Modules/CustomerSupport/Pages/Index',
        'X-Inertia-Partial-Data' => 'orders',
    ])->get(action([CustomerSupportController::class, 'index'], $query));
}

test('does not query or include orders on the initial page visit', function () {
    $user = User::factory()->create();
    $queries = [];
    DB::listen(function (QueryExecuted $query) use (&$queries): void {
        if (preg_match('/\b(orders|order_items|payments)\b/i', $query->sql)) {
            $queries[] = $query->sql;
        }
    });
    $this->actingAs($user)->get(action([CustomerSupportController::class, 'index']))
        ->assertOk()->assertInertia(fn (Assert $page) => $page
        ->component('Modules/CustomerSupport/Pages/Index', false)->missing('orders'));
    expect($queries)->toBeEmpty();
});

test('only returns the current users orders with item images and payment details', function () {
    $user = User::factory()->create();
    $order = customerSupportOrderFixture($user);
    customerSupportOrderFixture(User::factory()->create());

    customerSupportOrdersResponse($user)
        ->assertOk()->assertJsonCount(1, 'props.orders.data')
        ->assertJsonPath('props.orders.data.0.id', $order->id)
        ->assertJsonPath('props.orders.data.0.items.0.title', 'Keyboard')
        ->assertJsonPath('props.orders.data.0.items.0.image', asset('uploads/products/keyboard.jpg'))
        ->assertJsonPath('props.orders.data.0.total_amount', 3000)
        ->assertJsonPath('props.orders.data.0.order_status', 'DELIVERED')
        ->assertJsonPath('props.orders.data.0.payments.0.status', 'PAID')
        ->assertJsonMissingPath('props.products');
});

test('searches orders by number tracking code or product title', function (string $search) {
    $user = User::factory()->create();
    $order = customerSupportOrderFixture($user, ['order_number' => 'ORD-1234', 'tracking_code' => 'TRACK-5678']);
    customerSupportOrderFixture($user, [], 'Mouse');
    customerSupportOrderFixture(User::factory()->create(), [], 'Keyboard');

    customerSupportOrdersResponse($user, ['order_search' => $search])
        ->assertOk()->assertJsonCount(1, 'props.orders.data')
        ->assertJsonPath('props.orders.data.0.id', $order->id);
})->with(['ord-1234', 'track-5678', 'keyboard']);

test('filters orders by order and payment status', function () {
    $user = User::factory()->create();
    $order = customerSupportOrderFixture($user, ['order_status' => OrderStatusEnum::Shipped]);
    customerSupportOrderFixture($user);
    customerSupportOrderFixture($user, ['order_status' => OrderStatusEnum::Shipped, 'payment_status' => PaymentStatusEnum::Unpaid]);

    customerSupportOrdersResponse($user, ['order_status' => 'SHIPPED', 'order_payment_status' => 'PAID'])
        ->assertOk()->assertJsonCount(1, 'props.orders.data')
        ->assertJsonPath('props.orders.data.0.id', $order->id);
});

test('sorts orders by total amount', function (string $direction, array $expected) {
    $user = User::factory()->create();
    foreach ([3000, 1000, 2000] as $amount) {
        customerSupportOrderFixture($user, ['total_amount' => $amount]);
    }

    customerSupportOrdersResponse($user, ['order_sort' => $direction])
        ->assertOk()
        ->assertJsonPath('props.orders.data.0.total_amount', $expected[0])
        ->assertJsonPath('props.orders.data.1.total_amount', $expected[1])
        ->assertJsonPath('props.orders.data.2.total_amount', $expected[2]);
})->with(['ascending' => ['asc', [1000, 2000, 3000]], 'descending' => ['desc', [3000, 2000, 1000]]]);

test('paginates orders independently of product pagination', function (int $perPage, int $count) {
    $user = User::factory()->create();
    for ($index = 0; $index < 21; $index++) {
        customerSupportOrderFixture($user);
    }

    customerSupportOrdersResponse($user, ['orders_per_page' => $perPage, 'page' => 99])
        ->assertOk()->assertJsonCount($count, 'props.orders.data')
        ->assertJsonPath('props.orders.meta.per_page', $perPage)
        ->assertJsonPath('props.orders.meta.current_page', 1)
        ->assertJsonPath('props.orders.meta.total', 21);
})->with([[10, 10], [20, 20], [50, 21], [100, 21]]);

test('preserves filters and sorting on subsequent order pages', function () {
    $user = User::factory()->create();
    for ($index = 1; $index <= 21; $index++) {
        customerSupportOrderFixture($user, ['total_amount' => $index * 100]);
    }
    customerSupportOrderFixture($user, ['order_status' => OrderStatusEnum::Pending], 'Mouse');

    customerSupportOrdersResponse($user, ['order_search' => 'Keyboard', 'order_status' => 'DELIVERED', 'order_payment_status' => 'PAID', 'order_sort' => 'desc', 'orders_per_page' => 10, 'orders_page' => 2])
        ->assertOk()->assertJsonCount(10, 'props.orders.data')
        ->assertJsonPath('props.orders.data.0.total_amount', 1100)
        ->assertJsonPath('props.orders.data.9.total_amount', 200)
        ->assertJsonPath('props.orders.meta.current_page', 2)
        ->assertJsonPath('props.orders.meta.total', 21);
});

test('returns an empty order collection for an unmatched search', function () {
    $user = User::factory()->create();
    customerSupportOrderFixture($user);
    customerSupportOrdersResponse($user, ['order_search' => 'not-found'])
        ->assertOk()->assertJsonCount(0, 'props.orders.data')->assertJsonPath('props.orders.meta.total', 0);
});

test('handles an unavailable product in an existing order', function () {
    $user = User::factory()->create();
    $order = customerSupportOrderFixture($user);
    $order->orderItems()->firstOrFail()->product->delete();

    customerSupportOrdersResponse($user)->assertOk()
        ->assertJsonPath('props.orders.data.0.items.0.title', 'Unavailable product')
        ->assertJsonPath('props.orders.data.0.items.0.image', null);
});

test('rejects invalid order filters', function (array $query, string $field) {
    $this->actingAs(User::factory()->create())->getJson(action([CustomerSupportController::class, 'index'], $query))
        ->assertUnprocessable()->assertJsonValidationErrors($field);
})->with([
    [['order_status' => 'INVALID'], 'order_status'],
    [['order_payment_status' => 'INVALID'], 'order_payment_status'],
    [['order_sort' => 'INVALID'], 'order_sort'],
    [['orders_per_page' => 25], 'orders_per_page'],
    [['orders_page' => 0], 'orders_page'],
    [['order_search' => str_repeat('a', 256)], 'order_search'],
]);
