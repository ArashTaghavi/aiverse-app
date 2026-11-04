<?php

namespace App\Modules\DatabaseAnalyst\Events;

use App\Modules\DatabaseAnalyst\Enums\EventEnum;
use App\Modules\DatabaseAnalyst\Module;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AskCompleted implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(public DatabaseChatTurn $databaseChatTurn)
    {
        //
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel(Module::CHANNEL_PREFIX.".{$this->databaseChatTurn->database->owner_id}"),
        ];
    }

    public function broadcastAs(): string
    {
        return EventEnum::ANSWER_COMPLETED->value;
    }

    public function broadcastWith(): array
    {
        return [
            'database_id' => $this->databaseChatTurn->database_id,
            'answer_status' => $this->databaseChatTurn->answer_status,
        ];
    }
}
