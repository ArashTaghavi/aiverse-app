<?php

namespace App\Modules\ChatWithDocument\Events;

use App\Modules\ChatWithDocument\Enums\EventEnum;
use App\Modules\ChatWithDocument\Models\Document;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DocumentUploadProgress implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Document $document,
        public string $step,
        public string $status
    ) {}

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
        return EventEnum::UPLOAD_PROGRESS->value;
    }

    public function broadcastWith(): array
    {
        return [
            'step' => $this->step,
            'status' => $this->status,
            'document' => [
                'id' => $this->document->id,
                'title' => $this->document->title,
                'original_name' => $this->document->original_name,
                'human_size' => $this->document->human_size,
                'embedding_status' => $this->document->embedding_status,
                'embedding_error' => $this->document->embedding_error,
            ],
        ];
    }
}
