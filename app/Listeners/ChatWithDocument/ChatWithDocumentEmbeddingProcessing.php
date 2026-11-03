<?php

namespace App\Listeners\ChatWithDocument;

use App\Enums\ChatWithDocument\DocumentEmbeddingStatusEnum;
use App\Enums\ChatWithDocument\DocumentUploadProgressEnum;
use App\Events\ChatWithDocument\ChatWithDocumentEmbeddingRequested;
use App\Events\ChatWithDocument\ChatWithDocumentUploadProgress;
use App\Models\ChatWithDocument\Document;
use App\Services\AI\AIClient;
use App\Services\AI\ChatWithDocument\DTOs\IngestDTO;
use App\Services\AI\ChatWithDocument\Routes as ChatWithDocumentRoutes;
use Illuminate\Contracts\Queue\ShouldQueueAfterCommit;
use Throwable;

class ChatWithDocumentEmbeddingProcessing implements ShouldQueueAfterCommit
{
    public function __construct(private AIClient $client) {}

    /**
     * Handle the event.
     */
    public function handle(ChatWithDocumentEmbeddingRequested $event): void
    {
        $document = $event->document;
        $document->refresh();

        if ($document->embedding_status === DocumentEmbeddingStatusEnum::Completed) {
            $this->broadcastProgress($document, DocumentUploadProgressEnum::Embedding, 'completed');
            $this->broadcastProgress($document, DocumentUploadProgressEnum::Result, 'completed');

            return;
        }

        $document->update([
            'embedding_status' => DocumentEmbeddingStatusEnum::Processing,
            'embedding_error' => null,
        ]);

        $this->broadcastProgress($document, DocumentUploadProgressEnum::Embedding, 'processing');

        $data = new IngestDTO(
            filePath: $document->absolute_path,
            documentId: $document->id,
            ownerId: $document->owner_id
        );
        $this->client->post(ChatWithDocumentRoutes::INGEST, $data->toArray());
        $document->update([
            'embedding_status' => DocumentEmbeddingStatusEnum::Completed,
            'embedding_error' => null,
        ]);

        $this->broadcastProgress($document, DocumentUploadProgressEnum::Embedding, 'completed');
        $this->broadcastProgress($document, DocumentUploadProgressEnum::Result, 'completed');
    }

    public function failed(ChatWithDocumentEmbeddingRequested $event, Throwable $exception): void
    {
        $document = $event->document;
        $document->refresh();

        if ($document->embedding_status === DocumentEmbeddingStatusEnum::Completed) {
            return;
        }

        $document->update([
            'embedding_status' => DocumentEmbeddingStatusEnum::Failed,
            'embedding_error' => $exception->getMessage(),
        ]);

        $this->broadcastProgress($document, DocumentUploadProgressEnum::Embedding, 'failed');
        $this->broadcastProgress($document, DocumentUploadProgressEnum::Result, 'failed');
    }

    private function broadcastProgress(Document $document, DocumentUploadProgressEnum $step, string $status): void
    {
        // A socket failure must not trigger another embedding request.
        try {
            ChatWithDocumentUploadProgress::dispatch(
                document: $document,
                step: $step->value,
                status: $status,
            );
        } catch (Throwable $exception) {
            report($exception);
        }
    }
}
