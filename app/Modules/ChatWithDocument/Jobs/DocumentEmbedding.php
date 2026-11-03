<?php

namespace App\Modules\ChatWithDocument\Jobs;

use App\Modules\ChatWithDocument\Enums\DocumentUploadProgressEnum;
use App\Modules\ChatWithDocument\Enums\RouteEnum;
use App\Modules\ChatWithDocument\Events\DocumentUploadProgress;
use App\Modules\ChatWithDocument\Models\Document;
use App\Services\AI\AIClient;
use App\Services\AI\ChatWithDocument\DTOs\IngestDTO;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Throwable;

class DocumentEmbedding implements ShouldQueue
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

        $this->document->markAsProcessing();

        $client->post(RouteEnum::INGEST->value, $data->toArray());

        $this->document->markAsCompleted();

        DocumentUploadProgress::dispatch(
            document: $this->document,
            step: DocumentUploadProgressEnum::Embedding->value,
            status: 'completed',
        );
    }

    public function failed(?Throwable $exception): void
    {
        $this->document->markAsFailed(error: $exception?->getMessage());
    }
}
