<?php

namespace App\Modules\ChatWithDocument\Events;

use App\Modules\Base\Enums\AnswerStatusEnum;
use App\Modules\ChatWithDocument\Enums\EventEnum;
use App\Modules\ChatWithDocument\Models\DocumentChatTurn;
use App\Modules\ChatWithDocument\Module;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AskFailed implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(public DocumentChatTurn $documentChatTurn) {}

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel(Module::CHANNEL_PREFIX.".{$this->documentChatTurn->document->owner_id}"),
        ];
    }

    public function broadcastAs(): string
    {
        return EventEnum::ANSWER_FAILED->value;
    }

    /** @return array{document_id: int, answer_status: AnswerStatusEnum} */
    public function broadcastWith(): array
    {
        return [
            'document_id' => $this->documentChatTurn->document_id,
            'answer_status' => $this->documentChatTurn->answer_status,
        ];
    }
}
