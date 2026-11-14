<?php

namespace App\Modules\CustomerSupport\Resources;

use App\Modules\CustomerSupport\Models\OrderItem;
use App\Modules\CustomerSupport\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_number' => $this->order_number,
            'total_amount' => $this->total_amount,
            'order_status' => $this->order_status->value,
            'payment_status' => $this->payment_status->value,
            'tracking_code' => $this->tracking_code,
            'shipping_address' => $this->shipping_address,
            'created_at' => $this->created_at?->toIso8601String(),
            'paid_at' => $this->paid_at?->toIso8601String(),
            'shipped_at' => $this->shipped_at?->toIso8601String(),
            'delivered_at' => $this->delivered_at?->toIso8601String(),
            'cancelled_at' => $this->cancelled_at?->toIso8601String(),
            'cancellation_reason' => $this->cancellation_reason,
            'items' => $this->orderItems->map(fn (OrderItem $item): array => [
                'id' => $item->id,
                'title' => $item->product?->title ?? 'Unavailable product',
                'image' => $item->product?->image ? $item->product->image_url : null,
                'quantity' => $item->quantity,
                'unit_price' => $item->unit_price,
                'total_price' => $item->total_price,
            ]),
            'payments' => $this->payments->map(fn (Payment $payment): array => [
                'id' => $payment->id,
                'amount' => $payment->amount,
                'status' => $payment->status->value,
                'method' => $payment->method->value,
                'paid_at' => $payment->paid_at?->toIso8601String(),
            ]),
        ];
    }
}
