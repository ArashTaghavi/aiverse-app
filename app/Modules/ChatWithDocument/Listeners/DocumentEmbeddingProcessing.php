<?php

namespace App\Modules\ChatWithDocument\Listeners;

use App\Modules\Base\Enums\ProcessingStatusEnum;
use App\Modules\Base\Enums\UploadProgressEnum;
use App\Modules\Base\DTOs\IngestDTO;
use App\Modules\ChatWithDocument\Enums\RouteEnum;
use App\Modules\ChatWithDocument\Events\DocumentEmbeddingCompleted;
use App\Modules\ChatWithDocument\Events\DocumentEmbeddingFailed;
use App\Modules\ChatWithDocument\Events\DocumentEmbeddingRequested;
use App\Modules\ChatWithDocument\Events\DocumentUploadProgress;
use App\Modules\ChatWithDocument\Models\Document;
use App\Services\AIClient;
use Illuminate\Contracts\Queue\ShouldQueueAfterCommit;
use Throwable;

class DocumentEmbeddingProcessing implements ShouldQueueAfterCommit
{
    public int $timeout = 150;

    public int $tries = 1;

    public bool $failOnTimeout = true;

    public function __construct(private AIClient $client) {}

    /**
     * Handle the event.
     */
    public function handle(DocumentEmbeddingRequested $event): void
    {
        $document = $event->document;
        $document->refresh();

        if ($document->embedding_status === ProcessingStatusEnum::Completed) {
            $this->broadcastStatus($document);
            $this->broadcastProgress($document, UploadProgressEnum::Embedding, 'completed');
            $this->broadcastProgress($document, UploadProgressEnum::Result, 'completed');

            return;
        }

        $document->markAsProcessing();
        $this->broadcastProgress($document, UploadProgressEnum::Embedding, 'processing');

        $data = new IngestDTO(
            filePath: $document->absolute_path,
            documentId: $document->id,
            ownerId: $document->owner_id
        );

        $this->client->post(RouteEnum::Ingest->value, $data->toArray());
        $document->markAsCompleted();
        $this->broadcastStatus($document);

        $this->broadcastProgress($document, UploadProgressEnum::Embedding, 'completed');
        $this->broadcastProgress($document, UploadProgressEnum::Result, 'completed');
    }

    public function failed(DocumentEmbeddingRequested $event, Throwable $exception): void
    {
        $document = $event->document;
        $document->refresh();

        if ($document->embedding_status === ProcessingStatusEnum::Completed) {
            return;
        }

        $document->markAsFailed(error: $exception->getMessage());
        $this->broadcastStatus($document);

        $this->broadcastProgress($document, UploadProgressEnum::Embedding, 'failed');
        $this->broadcastProgress($document, UploadProgressEnum::Result, 'failed');
    }

    private function broadcastStatus(Document $document): void
    {
        try {
            if ($document->embedding_status === ProcessingStatusEnum::Completed) {
                DocumentEmbeddingCompleted::dispatch($document);
            } else {
                DocumentEmbeddingFailed::dispatch($document);
            }
        } catch (Throwable $exception) {
            report($exception);
        }
    }

    private function broadcastProgress(Document $document, UploadProgressEnum $step, string $status): void
    {
        // A socket failure must not trigger another embedding request.
        try {
            DocumentUploadProgress::dispatch(
                model: $document,
                step: $step->value,
                status: $status,
            );
        } catch (Throwable $exception) {
            report($exception);
        }
    }
}
