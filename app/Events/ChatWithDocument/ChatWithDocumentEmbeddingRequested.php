<?php

namespace App\Events\ChatWithDocument;

use App\Models\ChatWithDocument\Document;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ChatWithDocumentEmbeddingRequested
{
    use Dispatchable, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(public Document $document)
    {
        //
    }

}
