<?php

namespace App\Modules\ChatWithDocument\Events;

use App\Modules\ChatWithDocument\Models\Document;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DocumentEmbeddingRequested
{
    use Dispatchable, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(public Document $model)
    {
        //
    }

}
