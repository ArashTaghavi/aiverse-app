<?php

namespace App\Modules\CustomerSupport\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\CustomerSupport\Enums\OrderStatusEnum;
use App\Modules\CustomerSupport\Enums\PaymentStatusEnum;
use App\Modules\CustomerSupport\Resources\OrderResource;
use App\Modules\CustomerSupport\Resources\ProductResource;
use App\Modules\CustomerSupport\Services\CustomerSupportService;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CustomerSupportController extends Controller
{
    public function __construct(private CustomerSupportService $customerSupportService) {}

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
                fn () => ProductResource::collection(
                    $this->customerSupportService->products(name: $name, sort: $sort, perPage: $perPage)
                )
            ),
            'orders' => Inertia::optional(function () use ($validated, $request): AnonymousResourceCollection {
                $search = trim($validated['order_search'] ?? '');
                $orders = $this->customerSupportService->orders(user: $request->user(), search: $search, validated: $validated);

                return OrderResource::collection($orders);
            }),
        ]);
    }

    public function ask(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'question' => ['required_without:confirmation', Rule::prohibitedIf($request->has('confirmation')), 'string', 'max:1000'],
            'thread_id' => ['required_with:confirmation', 'string', 'max:255'],
            'confirmation' => ['required_without:question', Rule::prohibitedIf($request->has('question')), 'array:interrupt_id,confirmed'],
            'confirmation.interrupt_id' => ['required_with:confirmation', 'string', 'max:255'],
            'confirmation.confirmed' => ['required_with:confirmation', 'boolean:strict'],
        ]);

        try {
            $response = $this->customerSupportService->ask(
                user: $request->user(),
                question: $validated['question'] ?? null,
                threadId: $validated['thread_id'] ?? null,
                confirmation: $validated['confirmation'] ?? null,
            );

            return response()->json($response->json(), $response->status());
        } catch (RequestException $exception) {
            return response()->json([
                'message' => 'ارتباط با پشتیبانی انجام نشد. لطفاً دوباره تلاش کنید.',
            ], $exception->response->status());
        }
    }
}
