<?php

namespace App\Modules\ChatWithDocument\Jobs;

use App\Modules\ChatWithDocument\Events\DocumentEmbeddingRequested;
use App\Modules\ChatWithDocument\Listeners\DocumentEmbeddingProcessing;
use App\Modules\ChatWithDocument\Models\Document;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use RuntimeException;
use Throwable;

class DocumentEmbedding implements ShouldQueue
{
    use Queueable;

    public int $timeout = 150;

    public int $tries = 1;

    public bool $failOnTimeout = true;

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
    public function handle(DocumentEmbeddingProcessing $listener): void
    {
        $listener->handle(new DocumentEmbeddingRequested($this->document));
    }

    public function failed(?Throwable $exception): void
    {
        app(DocumentEmbeddingProcessing::class)->failed(
            new DocumentEmbeddingRequested($this->document),
            $exception ?? new RuntimeException('Document embedding failed.'),
        );
    }
}
