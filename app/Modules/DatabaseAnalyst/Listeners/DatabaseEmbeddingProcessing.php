<?php

namespace App\Modules\DatabaseAnalyst\Listeners;

use App\Modules\Base\DTOs\IngestDTO;
use App\Modules\Base\Enums\ModuleEnum;
use App\Modules\Base\Enums\ProcessingStatusEnum;
use App\Modules\Base\Enums\UploadProgressEnum;
use App\Modules\DatabaseAnalyst\Enums\RouteEnum;
use App\Modules\DatabaseAnalyst\Events\DatabaseEmbeddingRequested;
use App\Modules\DatabaseAnalyst\Events\DatabaseUploadProgress;
use App\Modules\DatabaseAnalyst\Models\Database;
use App\Services\AIClient;
use Illuminate\Contracts\Queue\ShouldQueueAfterCommit;
use Throwable;

class DatabaseEmbeddingProcessing implements ShouldQueueAfterCommit
{
    public function __construct(private AIClient $client) {}

    /**
     * Handle the event.
     */
    public function handle(DatabaseEmbeddingRequested $event): void
    {
        $database = $event->database;
        $database->refresh();

        if ($database->embedding_status === ProcessingStatusEnum::Completed) {
            $this->broadcastProgress($database, UploadProgressEnum::Embedding, 'completed');
            $this->broadcastProgress($database, UploadProgressEnum::Result, 'completed');

            return;
        }

        $database->markAsProcessing();
        $this->broadcastProgress($database, UploadProgressEnum::Embedding, 'processing');

        $data = new IngestDTO(
            filePath: $database->absolute_path,
            databaseId: $database->id,
            ownerId: $database->owner_id
        );

        $this->client->post(RouteEnum::Ingest->value, $data->toArray());
        $database->markAsCompleted();

        $this->broadcastProgress($database, UploadProgressEnum::Embedding, 'completed');
        $this->broadcastProgress($database, UploadProgressEnum::Result, 'completed');
    }

    public function failed(DatabaseEmbeddingRequested $event, Throwable $exception): void
    {
        $database = $event->database;
        $database->refresh();

        if ($database->embedding_status === ProcessingStatusEnum::Completed) {
            return;
        }

        $database->markAsFailed(error: $exception->getMessage());

        $this->broadcastProgress($database, UploadProgressEnum::Embedding, 'failed');
        $this->broadcastProgress($database, UploadProgressEnum::Result, 'failed');
    }

    private function broadcastProgress(Database $database, UploadProgressEnum $step, string $status): void
    {
        // A socket failure must not trigger another embedding request.
        try {
            DatabaseUploadProgress::dispatch(
                database: $database,
                step: $step->value,
                status: $status,
            );
        } catch (Throwable $exception) {
            report_exception(
                exception: $exception,
                module : ModuleEnum::DatabaseAnalyst->value,
            );
        }
    }
}
