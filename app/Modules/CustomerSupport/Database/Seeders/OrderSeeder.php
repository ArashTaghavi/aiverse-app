<?php

namespace App\Modules\CustomerSupport\Database\Seeders;

use App\Models\User;
use App\Modules\CustomerSupport\Enums\OrderStatusEnum;
use App\Modules\CustomerSupport\Enums\PaymentMethodEnum;
use App\Modules\CustomerSupport\Enums\PaymentStatusEnum;
use App\Modules\CustomerSupport\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use RuntimeException;

class OrderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::query()->findOrFail(1);
        $products = Product::query()->where('price', '>', 0)->get(['id', 'price']);

        if ($products->isEmpty()) {
            throw new RuntimeException('Seed products before running OrderSeeder.');
        }

        DB::transaction(function () use ($user, $products): void {
            $orderStatuses = OrderStatusEnum::cases();

            for ($index = 0; $index < 30; $index++) {
                $orderStatus = $orderStatuses[$index % count($orderStatuses)];
                $paymentStatus = match ($orderStatus) {
                    OrderStatusEnum::Pending => $index % 2 === 0 ? PaymentStatusEnum::Unpaid : PaymentStatusEnum::Failed,
                    OrderStatusEnum::Cancelled => $index % 2 === 0 ? PaymentStatusEnum::Refunded : PaymentStatusEnum::Unpaid,
                    default => PaymentStatusEnum::Paid,
                };
                $wasPaid = in_array($paymentStatus, [PaymentStatusEnum::Paid, PaymentStatusEnum::Refunded], true);
                $createdAt = now()->subDays(100 - ($index * 3))->setTime(10, 0);
                $paidAt = $wasPaid ? $createdAt->copy()->addMinutes(10) : null;
                $shippedAt = in_array($orderStatus, [OrderStatusEnum::Shipped, OrderStatusEnum::Delivered], true)
                    ? $createdAt->copy()->addDay() : null;
                $deliveredAt = $orderStatus === OrderStatusEnum::Delivered ? $createdAt->copy()->addDays(3) : null;
                $cancelledAt = $orderStatus === OrderStatusEnum::Cancelled ? $createdAt->copy()->addDay() : null;
                $refundedAt = $paymentStatus === PaymentStatusEnum::Refunded ? $cancelledAt->copy()->addMinutes(30) : null;
                $paymentUpdatedAt = $refundedAt ?? $paidAt ?? ($paymentStatus === PaymentStatusEnum::Failed ? $createdAt->copy()->addMinutes(10) : $createdAt);
                $updatedAt = $deliveredAt ?? $shippedAt ?? $refundedAt ?? $cancelledAt ?? $paymentUpdatedAt;
                $selectedProducts = $products->random(min(1 + ($index % 4), $products->count()));
                $items = [];
                $totalAmount = 0;

                foreach ($selectedProducts as $product) {
                    $quantity = fake()->numberBetween(1, 3);
                    $totalPrice = $product->price * $quantity;
                    $totalAmount += $totalPrice;

                    $items[] = [
                        'product_id' => $product->id,
                        'quantity' => $quantity,
                        'unit_price' => $product->price,
                        'total_price' => $totalPrice,
                        'created_at' => $createdAt,
                        'updated_at' => $createdAt,
                    ];
                }

                $order = $user->orders()->create([
                    'order_number' => 'DEMO-'.Str::uuid(),
                    'total_amount' => $totalAmount,
                    'order_status' => $orderStatus,
                    'payment_status' => $paymentStatus,
                    'tracking_code' => $shippedAt ? 'DEMO-TRACK-'.Str::uuid() : null,
                    'shipping_address' => 'تهران، خیابان ولیعصر، کوچه یاس، پلاک '.($index + 1).'، واحد ۱',
                    'paid_at' => $paidAt,
                    'shipped_at' => $shippedAt,
                    'delivered_at' => $deliveredAt,
                    'cancelled_at' => $cancelledAt,
                    'cancellation_reason' => $cancelledAt ? 'لغو سفارش به درخواست مشتری' : null,
                    'created_at' => $createdAt,
                    'updated_at' => $updatedAt,
                ]);

                $order->orderItems()->createMany($items);
                $order->payments()->create([
                    'amount' => $totalAmount,
                    'status' => $paymentStatus,
                    'method' => PaymentMethodEnum::Online,
                    'transaction_id' => $paymentStatus !== PaymentStatusEnum::Unpaid ? 'DEMO-TXN-'.Str::uuid() : null,
                    'reference_id' => $wasPaid ? 'DEMO-REF-'.Str::uuid() : null,
                    'paid_at' => $paidAt,
                    'refunded_at' => $refundedAt,
                    'failure_reason' => $paymentStatus === PaymentStatusEnum::Failed ? 'پرداخت توسط بانک تأیید نشد.' : '',
                    'created_at' => $createdAt,
                    'updated_at' => $paymentUpdatedAt,
                ]);
            }
        });
    }
}
