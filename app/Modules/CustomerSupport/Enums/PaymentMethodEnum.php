<?php

namespace App\Modules\CustomerSupport\Enums;

enum PaymentMethodEnum: string
{
    case Online = 'ONLINE';
    case Wallet = 'WALLET';
    case CardToCard = 'CARD_TO_CARD';
    case CashOnDelivery = 'CASH_ON_DELIVERY';
    case BankTransfer = 'BANK_TRANSFER';
}
