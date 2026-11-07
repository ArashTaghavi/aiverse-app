<?php

use App\Modules\Base\Enums\ProcessingStatusEnum;
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
        Schema::create('document_chat_turns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_id')->constrained()->cascadeOnDelete();

            $table->text('question');
            $table->text('answer')->nullable();

            $table->enum('answer_status', array_column(ProcessingStatusEnum::cases(), 'value'))->default(ProcessingStatusEnum::Pending->value);
            $table->text('answer_error')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('document_chat_turns');
    }
};
