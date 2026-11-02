<?php

namespace App\Events\ChatWithDocument;

use App\Models\ChatWithDocument\DocumentChatTurn;
use App\Services\AI\ChatWithDocument\Events as ChatWithDocumentEvent;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ChatWithDocumentAskCompleted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(public DocumentChatTurn $documentChatTurn)
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
            new PrivateChannel("chat-with-document.users.{$this->documentChatTurn->document->owner_id}"),
        ];
    }

    public function broadcastAs(): string
    {
        return ChatWithDocumentEvent::ANSWER_COMPLETED;
    }

    public function broadcastWith(): array
    {
        return [
            'document_id' => $this->documentChatTurn->document_id,
            'answer_status' => $this->documentChatTurn->answer_status,
        ];
    }
}
