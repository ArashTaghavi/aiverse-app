<?php

namespace App\Services\AI\ChatWithDocument\DTOs;

final readonly class AskDTO
{
    public function __construct(public string $question) {}
}
