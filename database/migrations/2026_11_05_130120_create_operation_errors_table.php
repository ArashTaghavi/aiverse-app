<?php

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
        Schema::create('operation_errors', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();

            $table->string('module', 100);
            $table->string('operation', 100);
            $table->string('source', 50)
                ->comment('Origin: request, job, listener, broadcast, external_service or frontend.');
            $table->string('environment', 50)->nullable();
            $table->string('service', 100)->nullable()
                ->comment('Service involved in the failure, such as fastapi or reverb.');

            $table->enum('severity', ['warning', 'error', 'critical'])->default('error');
            $table->enum('status', ['open', 'acknowledged', 'resolved', 'ignored'])->default('open')
                ->comment('Investigation status; independent of the document or message processing status.');
            $table->string('error_code', 100)
                ->comment('Stable application code, such as AI_TIMEOUT or BROADCAST_UNAVAILABLE.');
            $table->text('message');
            $table->text('user_message')->nullable()
                ->comment('Optional safe message for the affected user.');

            $table->nullableMorphs('subject');
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('correlation_id', 128)->nullable()
                ->comment('Shared identifier propagated across HTTP requests, jobs and external services.');
            $table->string('request_id', 128)->nullable();
            $table->char('fingerprint', 64)->nullable()
                ->comment('SHA-256 of normalized error identity for grouping; not unique.');

            $table->string('exception_class', 512)->nullable();
            $table->string('exception_code', 100)->nullable();
            $table->text('exception_message')->nullable();
            $table->text('exception_file')->nullable();
            $table->unsignedInteger('exception_line')->nullable();
            $table->longText('stack_trace')->nullable()
                ->comment('Optional sanitized trace; omit when the trace is kept only in application logs.');
            $table->string('log_reference', 255)->nullable();

            $table->string('http_method', 10)->nullable();
            $table->text('http_endpoint')->nullable()
                ->comment('Sanitized endpoint without credentials or sensitive query parameters.');
            $table->unsignedSmallInteger('http_status')->nullable();
            $table->unsignedInteger('duration_ms')->nullable();

            $table->uuid('job_uuid')->nullable()
                ->comment('Queue payload UUID; no foreign key because failed_jobs records may be pruned.');
            $table->string('job_class', 512)->nullable();
            $table->string('queue_connection', 100)->nullable();
            $table->string('queue_name', 255)->nullable();
            $table->unsignedInteger('attempt')->default(1)
                ->comment('Attempt that produced this occurrence; each occurrence is a separate row.');
            $table->unsignedInteger('max_attempts')->nullable();
            $table->boolean('is_retryable')->default(false);
            $table->boolean('is_terminal')->default(true)
                ->comment('Whether this failure ended the operation rather than triggering another attempt.');
            $table->timestampTz('retry_at', 3)->nullable()
                ->comment('Scheduled retry time, when known; does not schedule a retry by itself.');

            $table->string('event_name', 255)->nullable();
            $table->string('broadcast_connection', 100)->nullable();
            $table->string('broadcast_channel', 255)->nullable();

            $table->jsonb('context')->nullable()
                ->comment('Sanitized metadata only; exclude tokens, passwords and document contents.');
            $table->timestampTz('occurred_at', 3)->useCurrent();
            $table->timestampTz('acknowledged_at', 3)->nullable();
            $table->timestampTz('resolved_at', 3)->nullable();
            $table->foreignId('resolved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('resolution_notes')->nullable();
            $table->timestampsTz(3);

            $table->index(['status', 'occurred_at']);
            $table->index(['module', 'operation', 'occurred_at'], 'operation_errors_module_operation_time_index');
            $table->index(['user_id', 'occurred_at']);
            $table->index('correlation_id');
            $table->index('request_id');
            $table->index('job_uuid');
            $table->index(['fingerprint', 'occurred_at']);
            $table->index('occurred_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('operation_errors');
    }
};
