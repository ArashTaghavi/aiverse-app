<?php

namespace App\Modules\DatabaseAnalyst\Jobs;

use App\Modules\ChatWithDocument\DTOs\AskDTO;
use App\Modules\ChatWithDocument\Enums\RouteEnum;
use App\Modules\ChatWithDocument\Events\AskCompleted;
use App\Modules\ChatWithDocument\Events\AskFailed;
use App\Modules\ChatWithDocument\Models\DocumentChatTurn;
use App\Services\AIClient;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Throwable;

class Ask implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(public DocumentChatTurn $documentChatTurn) {}

    /**
     * Execute the job.
     */
    public function handle(AIClient $client): void
    {

        $data = new AskDTO(
            documentId: $this->documentChatTurn->document_id,
            ownerId: $this->documentChatTurn->document->owner_id,
            question: $this->documentChatTurn->question
        );

        $this->documentChatTurn->markAsProcessing();

        $response = $client->post(RouteEnum::ASK->value, $data->toArray());

        // TODO
        $answer = json_decode($response->json('answer'));

        $this->documentChatTurn->markAsCompleted(answer: $answer);
        $this->documentChatTurn->document->update(['last_message' => $answer]);

        // A broadcast failure must not repeat a successful AI request.
        try {
            AskCompleted::dispatch($this->documentChatTurn);
        } catch (Throwable $exception) {
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
