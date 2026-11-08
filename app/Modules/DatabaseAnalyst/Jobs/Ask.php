<?php

namespace App\Modules\DatabaseAnalyst\Jobs;

use App\Modules\Base\Enums\ModuleEnum;
use App\Modules\Base\DTOs\AskDTO;
use App\Modules\ChatWithDocument\Enums\RouteEnum;
use App\Modules\ChatWithDocument\Events\AskCompleted;
use App\Modules\ChatWithDocument\Events\AskFailed;
use App\Modules\DatabaseAnalyst\Models\DatabaseChatTurn;
use App\Services\AIClient;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Throwable;

class Ask implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(public DatabaseChatTurn $databaseChatTurn) {}

    /**
     * Execute the job.
     */
    public function handle(AIClient $client): void
    {

        $data = new AskDTO(
            documentId: $this->databaseChatTurn->document_id,
            ownerId: $this->databaseChatTurn->document->owner_id,
            question: $this->databaseChatTurn->question
        );

        $this->databaseChatTurn->markAsProcessing();

        $response = $client->post(RouteEnum::Ask->value, $data->toArray());

        // TODO
        $answer = json_decode($response->json('answer'));

        $this->databaseChatTurn->markAsCompleted(answer: $answer);
        $this->databaseChatTurn->document->update(['last_message' => $answer]);

        // A broadcast failure must not repeat a successful AI request.
        try {
            AskCompleted::dispatch($this->databaseChatTurn);
        } catch (Throwable $exception) {
            report($exception);
        }
    }

    public function failed(?Throwable $exception): void
    {
        $this->databaseChatTurn->markAsFailed(error: $exception?->getMessage());

        try {
            AskFailed::dispatch($this->databaseChatTurn);
        } catch (Throwable $exception) {
            report_exception(
                exception: $exception,
                module : ModuleEnum::DatabaseAnalyst->value,
                jobClass : self::class,
            );
        }
    }
}
