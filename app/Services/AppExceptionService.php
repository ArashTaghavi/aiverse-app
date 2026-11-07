<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Throwable;
use WeakMap;

class AppExceptionService
{
    private WeakMap $reported;

    public function __construct()
    {
        $this->reported = new WeakMap;
    }

    public function report(
        Throwable $exception,
        ?string $module = null,
        ?string $jobClass = null,
        ?string $eventClass = null,
        ?string $broadcastChannel = null,
        ?int $responseStatus = null,
        ?string $responseBody = null,
        ?array $payload = null,
        ?array $context = null,
    ): void {
        if (isset($this->reported[$exception])) {
            return;
        }

        try {
            $now = now();
            $isConsole = app()->runningInConsole();

            DB::table('app_exceptions')->insert([
                'user_id' => auth()?->id(),
                'exception_class' => $exception::class,
                'message' => $exception->getMessage(),
                'file' => $exception->getFile(),
                'line' => $exception->getLine(),
                'trace' => $exception->getTraceAsString(),

                'request_method' => $isConsole ? null : request()->method(),
                'request_url' => $isConsole ? null : request()->fullUrl(),
                'route_name' => $isConsole ? null : request()->route()?->getName(),

                'module' => $module,
                'job_class' => $jobClass,
                'event_class' => $eventClass,
                'broadcast_channel' => $broadcastChannel,

                'response_status' => $responseStatus,
                'response_body' => $responseBody,

                'payload' => $payload === null
                    ? null
                    : json_encode($payload, JSON_THROW_ON_ERROR | JSON_INVALID_UTF8_SUBSTITUTE),

                'context' => $context === null
                    ? null
                    : json_encode($context, JSON_THROW_ON_ERROR | JSON_INVALID_UTF8_SUBSTITUTE),

                'created_at' => $now,
                'updated_at' => $now,
            ]);

            $this->reported[$exception] = true;
        } catch (Throwable $reportingException) {
            error_log(
                'App exception storage failed: '.$reportingException->getMessage()
            );
        }
    }
}
