<?php

namespace App\Events\ChatWithDocument;

use App\Models\ChatWithDocument\Document;
use App\Services\AI\ChatWithDocument\Events as ChatWithDocumentEvent;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ChatWithDocumentEmbeddingCompleted implements ShouldBroadcast
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
            new PrivateChannel("chat-with-document.users.{$this->document->owner_id}"),
        ];
    }

    public function broadcastAs(): string
    {
        return ChatWithDocumentEvent::EMBEDDING_COMPLETED;
    }

    public function broadcastWith(): array
    {
        return [
            'document_id' => $this->document->id,
            'embedding_status' => $this->document->embedding_status
        ];
    }
}
