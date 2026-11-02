<?php

namespace App\Jobs\ChatWithDocument;

use App\Enums\ChatWithDocument\DocumentEmbeddingStatusEnum;
use App\Events\ChatWithDocument\ChatWithDocumentEmbeddingCompleted;
use App\Models\ChatWithDocument\Document;
use App\Services\AI\AIClient;
use App\Services\AI\ChatWithDocument\DTOs\IngestDTO;
use App\Services\AI\ChatWithDocument\Routes as ChatWithDocumentRoutes;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Throwable;

class ChatWithDocumentEmbedding implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(public Document $document)
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(AIClient $client): void
    {
        $data = new IngestDTO(
            filePath: $this->document->absolute_path,
            documentId: $this->document->id,
            ownerId: $this->document->owner_id
        );

        $this->document->update([
            'embedding_status' => DocumentEmbeddingStatusEnum::Processing,
        ]);

        $client->post(ChatWithDocumentRoutes::INGEST, $data->toArray());

        $this->document->update([
            'embedding_status' => DocumentEmbeddingStatusEnum::Completed,
        ]);

        ChatWithDocumentEmbeddingCompleted::dispatch($this->document);
    }

    public function failed(?Throwable $exception): void
    {
        $this->document->update([
            'embedding_status' => DocumentEmbeddingStatusEnum::Failed,
            'embedding_error' => $exception?->getMessage(),
        ]);
    }
}
