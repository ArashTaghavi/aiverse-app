<?php

namespace App\Modules\ChatWithDocument\Events;

use App\Modules\Base\Enums\ProcessingStatusEnum;
use App\Modules\ChatWithDocument\Enums\EventEnum;
use App\Modules\ChatWithDocument\Models\Document;
use App\Modules\ChatWithDocument\Module;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DocumentEmbeddingCompleted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(public Document $document)
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
            new PrivateChannel(Module::CHANNEL_PREFIX.".{$this->document->owner_id}"),
        ];
    }

    public function broadcastAs(): string
    {
        return EventEnum::EmbeddingCompleted->value;
    }

    /** @return array{document_id: int, embedding_status: ProcessingStatusEnum} */
    public function broadcastWith(): array
    {
        return [
            'document_id' => $this->document->id,
            'embedding_status' => $this->document->embedding_status,
        ];
    }
}
