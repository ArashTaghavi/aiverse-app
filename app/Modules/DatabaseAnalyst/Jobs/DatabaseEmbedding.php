<?php

namespace App\Modules\DatabaseAnalyst\Jobs;

use App\Modules\Base\DTOs\IngestDTO;
use App\Modules\Base\Enums\Module;
use App\Modules\Base\Enums\UploadProgressEnum;
use App\Modules\DatabaseAnalyst\Enums\RouteEnum;
use App\Modules\DatabaseAnalyst\Events\DatabaseUploadProgress;
use App\Modules\DatabaseAnalyst\Models\Database;
use App\Services\AIClient;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Throwable;

class DatabaseEmbedding implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(public Database $database)
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(AIClient $client): void
    {
        $data = new IngestDTO(
            filePath: $this->database->absolute_path,
            databaseId: $this->database->id,
            ownerId: $this->database->owner_id
        );

        $this->database->markAsProcessing();

        $client->post(RouteEnum::INGEST->value, $data->toArray());

        $this->database->markAsCompleted();

        DatabaseUploadProgress::dispatch(
            database: $this->database,
            step: UploadProgressEnum::Embedding->value,
            status: 'completed',
        );
    }

    public function failed(?Throwable $exception): void
    {
        $this->database->markAsFailed(error: $exception?->getMessage());
        report_exception(
            exception: $exception,
            module : Module::DatabaseAnalyst->value,
            jobClass : self::class,
        );
    }
}
