<?php

use App\Modules\CustomerSupport\Enums\PaymentMethodEnum;
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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained();
            $table->unsignedBigInteger('amount');
            $table->string('status')->default(PaymentStatusEnum::Unpaid->value);
            $table->string('method')->default(PaymentMethodEnum::Online->value);
            $table->string('transaction_id')->unique()->nullable();
            $table->string('reference_id')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('refunded_at')->nullable();
            $table->text('failure_reason')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
