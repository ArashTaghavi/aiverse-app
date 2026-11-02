<?php

namespace App\Jobs\ChatWithDocument;

use App\Enums\ChatWithDocument\AnswerStatusEnum;
use App\Events\ChatWithDocument\ChatWithDocumentAskCompleted;
use App\Models\ChatWithDocument\DocumentChatTurn;
use App\Services\AI\AIClient;
use App\Services\AI\ChatWithDocument\DTOs\AskDTO;
use App\Services\AI\ChatWithDocument\Routes as ChatWithDocumentRoutes;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Throwable;

class ChatWithDocumentAsk implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(public DocumentChatTurn $documentChatTurn)
    {
        $data = new AskDTO(
            documentId: $this->documentChatTurn->document_id,
            ownerId: $this->documentChatTurn->document->owner_id,
            question: $this->documentChatTurn->question
        );
    }

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
        $this->documentChatTurn->update([
            'answer_status' => AnswerStatusEnum::Processing,
        ]);
        $answer = $client->post(ChatWithDocumentRoutes::ASK, $data->toArray());

        $this->documentChatTurn->update([
            'answer_status' => AnswerStatusEnum::Completed,
            'answer' => $answer,
        ]);

        ChatWithDocumentAskCompleted::dispatch($this->documentChatTurn);
    }

    public function failed(?Throwable $exception): void
    {
        $this->documentChatTurn->update([
            'answer_status' => AnswerStatusEnum::Failed,
            'answer_error' => $exception?->getMessage(),
        ]);
    }
}
