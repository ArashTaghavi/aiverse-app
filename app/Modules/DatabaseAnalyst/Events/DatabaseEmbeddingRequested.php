<?php

namespace App\Modules\DatabaseAnalyst\Events;

use App\Modules\DatabaseAnalyst\Models\Database;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DatabaseEmbeddingRequested
{
    use Dispatchable, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(public Database $model)
    {
        //
    }

}
