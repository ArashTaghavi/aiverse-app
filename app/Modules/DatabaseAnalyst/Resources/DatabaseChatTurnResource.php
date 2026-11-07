<?php

namespace App\Modules\DatabaseAnalyst\Resources;

use App\Modules\ChatWithDocument\Models\DocumentChatTurn;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin DocumentChatTurn */
class DatabaseChatTurnResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'question' => $this->question,
            'answer' => $this->answer,
            'answer_status' => $this->answer_status,
            'created_at' => $this->created_at,
        ];
    }
}
