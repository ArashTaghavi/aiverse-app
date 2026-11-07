<?php

use App\Services\AppExceptionService;

if (! function_exists('report_exception')) {
    function report_exception(
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
        app(AppExceptionService::class)->report(
            exception: $exception,
            module: $module,
            jobClass: $jobClass,
            eventClass: $eventClass,
            broadcastChannel: $broadcastChannel,
            responseStatus: $responseStatus,
            responseBody: $responseBody,
            payload: $payload,
            context: $context,
        );
    }
}
