<?php

namespace App\Modules\DatabaseAnalyst\Events;

use App\Modules\DatabaseAnalyst\Enums\EventEnum;
use App\Modules\DatabaseAnalyst\Models\Database;
use App\Modules\DatabaseAnalyst\Module;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DatabaseEmbeddingCompleted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(public Database $database)
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
            new PrivateChannel(Module::CHANNEL_PREFIX.".{$this->database->owner_id}"),
        ];
    }

    public function broadcastAs(): string
    {
        return EventEnum::EMBEDDING_COMPLETED->value;
    }

    public function broadcastWith(): array
    {
        return [
            'database_id' => $this->database->id,
            'embedding_status' => $this->database->embedding_status,
        ];
    }
}
