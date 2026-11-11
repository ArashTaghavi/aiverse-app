<?php

namespace App\Modules\CustomerSupport\Models;

use App\Modules\CustomerSupport\Enums\PaymentMethodEnum;
use App\Modules\CustomerSupport\Enums\PaymentStatusEnum;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Override;

#[Fillable([
    'order_id',
    'amount',
    'status',
    'method',
    'transaction_id',
    'reference_id',
    'paid_at',
    'refunded_at',
    'failure_reason',
])]
class Payment extends Model
{
    #[Override]
    public function casts(): array
    {
        return [
            'order_id' => 'integer',
            'amount' => 'integer',
            'status' => PaymentStatusEnum::class,
            'method' => PaymentMethodEnum::class,
            'paid_at' => 'datetime',
            'refunded_at' => 'datetime',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
