<?php

namespace App\Modules\ChatWithDocument\Jobs;

use App\Modules\ChatWithDocument\DTOs\AskDTO;
use App\Modules\ChatWithDocument\Enums\RouteEnum;
use App\Modules\ChatWithDocument\Events\AskCompleted;
use App\Modules\ChatWithDocument\Models\DocumentChatTurn;
use App\Services\AI\AIClient;
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

        $answer = $client->post(RouteEnum::ASK->value, $data->toArray());

        $this->documentChatTurn->markAsCompleted(answer: $answer);

        AskCompleted::dispatch($this->documentChatTurn);
    }

    public function failed(?Throwable $exception): void
    {
        $this->documentChatTurn->markAsFailed(error: $exception?->getMessage());
    }
}
