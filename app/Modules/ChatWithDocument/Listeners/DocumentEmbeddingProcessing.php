<?php

namespace App\Modules\ChatWithDocument\Listeners;

use App\Modules\ChatWithDocument\DTOs\IngestDTO;
use App\Modules\ChatWithDocument\Enums\DocumentEmbeddingStatusEnum;
use App\Modules\ChatWithDocument\Enums\DocumentUploadProgressEnum;
use App\Modules\ChatWithDocument\Enums\RouteEnum;
use App\Modules\ChatWithDocument\Events\DocumentEmbeddingRequested;
use App\Modules\ChatWithDocument\Events\DocumentUploadProgress;
use App\Modules\ChatWithDocument\Models\Document;
use App\Services\AIClient;
use Illuminate\Contracts\Queue\ShouldQueueAfterCommit;
use Throwable;

class DocumentEmbeddingProcessing implements ShouldQueueAfterCommit
{
    public function __construct(private AIClient $client) {}

    /**
     * Handle the event.
     */
    public function handle(DocumentEmbeddingRequested $event): void
    {
        $document = $event->document;
        $document->refresh();

        if ($document->embedding_status === DocumentEmbeddingStatusEnum::Completed) {
            $this->broadcastProgress($document, DocumentUploadProgressEnum::Embedding, 'completed');
            $this->broadcastProgress($document, DocumentUploadProgressEnum::Result, 'completed');

            return;
        }

        $document->markAsProcessing();
        $this->broadcastProgress($document, DocumentUploadProgressEnum::Embedding, 'processing');

        $data = new IngestDTO(
            filePath: $document->absolute_path,
            documentId: $document->id,
            ownerId: $document->owner_id
        );

        $this->client->post(RouteEnum::INGEST->value, $data->toArray());
        $document->markAsCompleted();

        $this->broadcastProgress($document, DocumentUploadProgressEnum::Embedding, 'completed');
        $this->broadcastProgress($document, DocumentUploadProgressEnum::Result, 'completed');
    }

    public function failed(DocumentEmbeddingRequested $event, Throwable $exception): void
    {
        $document = $event->document;
        $document->refresh();

        if ($document->embedding_status === DocumentEmbeddingStatusEnum::Completed) {
            return;
        }

        $document->markAsFailed(error: $exception->getMessage());

        $this->broadcastProgress($document, DocumentUploadProgressEnum::Embedding, 'failed');
        $this->broadcastProgress($document, DocumentUploadProgressEnum::Result, 'failed');
    }

    private function broadcastProgress(Document $document, DocumentUploadProgressEnum $step, string $status): void
    {
        // A socket failure must not trigger another embedding request.
        try {
            DocumentUploadProgress::dispatch(
                document: $document,
                step: $step->value,
                status: $status,
            );
        } catch (Throwable $exception) {
            report($exception);
        }
    }
}
