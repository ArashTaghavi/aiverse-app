<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('app_exceptions', function (Blueprint $table) {
            $table->id();

            // Default exception information
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('exception_class');
            $table->text('message');
            $table->text('file');
            $table->unsignedInteger('line');
            $table->longText('trace');

            // Request information
            $table->string('request_method')->nullable();
            $table->text('request_url')->nullable();
            $table->string('route_name')->nullable();

            // Application information
            $table->string('module')->nullable();
            $table->string('job_class')->nullable();
            $table->string('event_class')->nullable();
            $table->string('broadcast_channel')->nullable();

            // External API information
            $table->unsignedSmallInteger('response_status')->nullable();
            $table->longText('response_body')->nullable();

            // Additional information
            $table->json('payload')->nullable();
            $table->json('context')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('app_exceptions');
    }
};
