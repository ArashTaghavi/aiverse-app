<?php

namespace App\Modules\CustomerSupport\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\CustomerSupport\Enums\OrderStatusEnum;
use App\Modules\CustomerSupport\Enums\PaymentStatusEnum;
use App\Modules\CustomerSupport\Models\Product;
use App\Modules\CustomerSupport\Resources\OrderResource;
use App\Modules\CustomerSupport\Resources\ProductResource;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;
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
            'order_search' => ['nullable', 'string', 'max:255'],
            'order_status' => ['nullable', Rule::enum(OrderStatusEnum::class)],
            'order_payment_status' => ['nullable', Rule::enum(PaymentStatusEnum::class)],
            'order_sort' => ['nullable', 'in:asc,desc'],
            'orders_per_page' => ['sometimes', 'integer', 'in:10,20,50,100'],
            'orders_page' => ['sometimes', 'integer', 'min:1'],
        ]);

        $name = trim($validated['name'] ?? '');
        $sort = $validated['sort'] ?? null;
        $perPage = (int) ($validated['per_page'] ?? 10);

        return Inertia::render('Modules/CustomerSupport/Pages/Index', [
            'products' => Inertia::optional(
                fn () => ProductResource::collection(Product::with('productCategory')
                    ->when($name !== '', fn (Builder $query): Builder => $query->whereLike('title', "%{$name}%"))
                    ->when($sort !== null, fn (Builder $query): Builder => $query->orderBy('price', $sort))
                    ->orderBy('id')
                    ->paginate($perPage)->withQueryString())
            ),
            'orders' => Inertia::optional(function () use ($request, $validated): AnonymousResourceCollection {
                $search = trim($validated['order_search'] ?? '');

                return OrderResource::collection($request->user()->orders()
                    ->with(['orderItems.product', 'payments'])
                    ->when($search !== '', function (Builder $query) use ($search): void {
                        $query->where(function (Builder $query) use ($search): void {
                            $query->whereLike('order_number', "%{$search}%")
                                ->orWhereLike('tracking_code', "%{$search}%")
                                ->orWhereHas('orderItems.product', fn (Builder $query): Builder => $query->whereLike('title', "%{$search}%"));
                        });
                    })
                    ->when($validated['order_status'] ?? null, fn (Builder $query, string $status): Builder => $query->where('order_status', $status))
                    ->when($validated['order_payment_status'] ?? null, fn (Builder $query, string $status): Builder => $query->where('payment_status', $status))
                    ->when($validated['order_sort'] ?? null, fn (Builder $query, string $sort): Builder => $query->orderBy('total_amount', $sort))
                    ->orderByDesc('id')
                    ->paginate((int) ($validated['orders_per_page'] ?? 10), ['*'], 'orders_page')
                    ->withQueryString());
            }),
        ]);
    }
}
