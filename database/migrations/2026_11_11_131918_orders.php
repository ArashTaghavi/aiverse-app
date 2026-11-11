<?php

use App\Modules\CustomerSupport\Enums\OrderStatusEnum;
use App\Modules\CustomerSupport\Enums\PaymentStatusEnum;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained();
            $table->string('order_number')->unique();
            $table->unsignedBigInteger('total_amount');
            $table->string('order_status')->default(OrderStatusEnum::Pending->value);
            $table->string('payment_status')->default(PaymentStatusEnum::Unpaid->value);
            $table->string('tracking_code')->unique()->nullable();
            $table->text('shipping_address');
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('shipped_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();

            $table->text('cancellation_reason')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
