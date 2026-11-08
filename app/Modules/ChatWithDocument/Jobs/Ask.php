<?php

namespace App\Modules\ChatWithDocument\Jobs;

use App\Modules\Base\DTOs\AskDTO;
use App\Modules\ChatWithDocument\Enums\RouteEnum;
use App\Modules\ChatWithDocument\Events\AskCompleted;
use App\Modules\ChatWithDocument\Events\AskFailed;
use App\Modules\ChatWithDocument\Models\DocumentChatTurn;
use App\Services\AIClient;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Throwable;
use UnexpectedValueException;

class Ask implements ShouldQueue
{
    use Queueable;

    public int $timeout = 150;

    public int $tries = 1;

    public bool $failOnTimeout = true;

    /**
     * Create a new job instance.
     */
    public function __construct(public DocumentChatTurn $documentChatTurn) {}

    /**
     * Execute the job.
     */
    public function handle(AIClient $client): void
    {
        $startedAt = hrtime(true);
        $context = ['turn_id' => $this->documentChatTurn->id];
        Log::debug('Document chat: job started', $context + [
            'turn_age_ms' => round((microtime(true) - $this->documentChatTurn->created_at->getTimestamp()) * 1000, 2),
        ]);

        $data = new AskDTO(
            documentId: $this->documentChatTurn->document_id,
            ownerId: $this->documentChatTurn->document->owner_id,
            question: $this->documentChatTurn->question
        );

        $this->documentChatTurn->markAsProcessing();

        $aiStartedAt = hrtime(true);
        Log::debug('Document chat: AI request started', $context);
        $response = $client->post(RouteEnum::Ask->value, $data->toArray());
        Log::debug('Document chat: AI response received', $context + [
            'ai_ms' => round((hrtime(true) - $aiStartedAt) / 1_000_000, 2),
        ]);

        $answer = str_contains(strtolower($response->header('Content-Type')), 'json')
            ? $response->json('answer')
            : $response->body();

        if (! is_string($answer) || trim($answer) === '') {
            throw new UnexpectedValueException('The AI service returned an invalid answer.');
        }

        $this->documentChatTurn->markAsCompleted(answer: $answer);
        $this->documentChatTurn->document->update(['last_message' => $answer]);
        Log::debug('Document chat: answer saved', $context + [
            'job_elapsed_ms' => round((hrtime(true) - $startedAt) / 1_000_000, 2),
        ]);

        // A broadcast failure must not repeat a successful AI request.
        $broadcastStartedAt = hrtime(true);
        try {
            AskCompleted::dispatch($this->documentChatTurn);
            Log::debug('Document chat: broadcast completed', $context + [
                'broadcast_ms' => round((hrtime(true) - $broadcastStartedAt) / 1_000_000, 2),
            ]);
        } catch (Throwable $exception) {
            Log::debug('Document chat: broadcast failed', $context + [
                'broadcast_ms' => round((hrtime(true) - $broadcastStartedAt) / 1_000_000, 2),
            ]);
            report($exception);
        }
    }

    public function failed(?Throwable $exception): void
    {
        $this->documentChatTurn->markAsFailed(error: $exception?->getMessage());

        try {
            AskFailed::dispatch($this->documentChatTurn);
        } catch (Throwable $broadcastException) {
            report($broadcastException);
        }
    }
}
