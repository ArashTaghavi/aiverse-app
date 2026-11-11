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
        Schema::create('databases', function (Blueprint $table) {
            $table->id();
            $table->uuid();
            $table->foreignId('owner_id')->constrained('users');

            // Database
            $table->string('title');
            $table->string('original_name');
            $table->string('storage_path');
            $table->string('mime_type');
            $table->string('extension');
            $table->unsignedBigInteger('size');

            // Docker
            $table->text('connection')->nullable();
            $table->text('database_schema')->nullable();

            // Provisioning
            $table->string('container_provisioning_status')->default('pending');
            $table->text('container_provisioning_error')->nullable();

            // Schema Embedding
            $table->enum(
                'embedding_status',
                array_column(ProcessingStatusEnum::cases(), 'value')
            )->default(ProcessingStatusEnum::Pending->value);

            $table->text('embedding_error')->nullable();

            // Chat
            $table->text('last_message')->nullable();

            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('databases');
    }
};
