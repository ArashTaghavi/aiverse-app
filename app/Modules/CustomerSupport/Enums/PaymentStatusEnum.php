<?php

namespace App\Modules\CustomerSupport\Enums;

enum PaymentStatusEnum: string
{
    case Unpaid = 'UNPAID';
    case Paid = 'PAID';
    case Failed = 'FAILED';
    case Refunded = 'REFUNDED';
}
