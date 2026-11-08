<?php

namespace App\Modules\DatabaseAnalyst\Jobs;

use App\Modules\Base\DTOs\AskDTO;
use App\Modules\Base\Enums\ModuleEnum;
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
    public function __construct(public DatabaseChatTurn $chatTurn) {}

    /**
     * Execute the job.
     */
    public function handle(AIClient $client): void
    {

        $data = new AskDTO(
            documentId: $this->chatTurn->document_id,
            ownerId: $this->chatTurn->document->owner_id,
            question: $this->chatTurn->question
        );

        $this->chatTurn->markAsProcessing();

        $response = $client->post(RouteEnum::Ask->value, $data->toArray());

        // TODO
        $answer = json_decode($response->json('answer'));

        $this->chatTurn->markAsCompleted(answer: $answer);
        $this->chatTurn->document->update(['last_message' => $answer]);

        // A broadcast failure must not repeat a successful AI request.
        try {
            AskCompleted::dispatch($this->chatTurn);
        } catch (Throwable $exception) {
            report($exception);
        }
    }

    public function failed(?Throwable $exception): void
    {
        $this->chatTurn->markAsFailed(error: $exception?->getMessage());

        try {
            AskFailed::dispatch($this->chatTurn);
        } catch (Throwable $exception) {
            report_exception(
                exception: $exception,
                module : ModuleEnum::DatabaseAnalyst->value,
                jobClass : self::class,
            );
        }
    }
}
