<?php

namespace App\Modules\CustomerSupport\Services;

use App\Models\User;
use App\Modules\CustomerSupport\Enums\RouteEnum;
use App\Modules\CustomerSupport\Models\Product;
use App\Services\AIClient;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Client\Response;
use Illuminate\Pagination\LengthAwarePaginator;

class CustomerSupportService
{
    public function __construct(public AIClient $aiClient) {}

    public function products(?string $name, ?string $sort, int $perPage): LengthAwarePaginator
    {
        return Product::with('productCategory')
            ->when($name !== '', fn (Builder $query): Builder => $query->whereLike('title', "%{$name}%"))
            ->when($sort !== null, fn (Builder $query): Builder => $query->orderBy('price', $sort))
            ->orderBy('id')
            ->paginate($perPage)->withQueryString();
    }

    public function orders(User $user, string $search, array $validated): LengthAwarePaginator
    {
        return $user->orders()
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
            ->withQueryString();
    }

    public function ask(User $user, ?string $question = null, ?string $threadId = null, ?array $confirmation = null): Response
    {
        $payload = ['user_id' => $user->id];
        if ($question !== null) {
            $payload['question'] = $question;
        }
        if ($threadId !== null) {
            $payload['thread_id'] = $threadId;
        }
        if ($confirmation !== null) {
            $payload['confirmation'] = $confirmation;
        }

        return $this->aiClient->post(RouteEnum::Ask->value, $payload);
    }
}
