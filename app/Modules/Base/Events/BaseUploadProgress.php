<?php

namespace App\Modules\Base\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

abstract class BaseUploadProgress implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Model $model,
        public string $step,
        public string $status
    ) {}

    abstract protected function channelPrefix(): string;

    abstract public function broadcastAs(): string;

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel(
                $this->channelPrefix().'.'.$this->model->owner_id
            ),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'step' => $this->step,
            'status' => $this->status,
            'data' => [
                'id' => $this->model->id,
                'uuid' => $this->model->uuid,
                'title' => $this->model->title,
                'original_name' => $this->model->original_name,
                'human_size' => $this->model->human_size,
                'embedding_status' => $this->model->embedding_status,
                'embedding_error' => $this->model->embedding_error,
            ],
        ];
    }
}
