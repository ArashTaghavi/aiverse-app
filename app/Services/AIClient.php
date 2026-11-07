<?php

namespace App\Services;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Psr\Http\Message\StreamInterface;

class AIClient
{
    private function client(): PendingRequest
    {
        return Http::baseUrl(config('ai.url'))
            // ->acceptJson()
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

    public function streamPost(string $route, array $data = []): StreamInterface
    {
        return $this->client()
            ->accept('text/plain')
            ->timeout(300)
            ->withOptions(['stream' => true, 'read_timeout' => 300])
            ->post($route, $data)
            ->throw()
            ->toPsrResponse()
            ->getBody();
    }
}
