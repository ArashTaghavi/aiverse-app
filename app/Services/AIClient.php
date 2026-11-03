<?php

namespace App\Services;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;

class AIClient
{
    private function client(): PendingRequest
    {
        return Http::baseUrl(config('ai.url'))
            ->acceptJson()
            ->connectTimeout(5)
            ->timeout(120);
    }

    public function get(string $route, array $query)
    {
        return $this->client()
            ->get($route, $query)
            ->throw();
    }

    public function post(string $route, array $data = []): Response
    {
        return $this->client()
            ->post($route, $data)
            ->throw();
    }
}
