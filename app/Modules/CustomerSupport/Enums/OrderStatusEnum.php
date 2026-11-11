<?php

namespace App\Modules\CustomerSupport\Enums;

enum OrderStatusEnum: string
{
    case Pending = 'PENDING';
    case Processing = 'PROCESSING';
    case Shipped = 'SHIPPED';
    case Delivered = 'DELIVERED';
    case Cancelled = 'CANCELLED';
}
