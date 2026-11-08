<?php

namespace App\Modules\DatabaseAnalyst\Services;

use App\Modules\Base\Services\BaseService;
use App\Modules\DatabaseAnalyst\Enums\RouteEnum;
use App\Modules\DatabaseAnalyst\Events\DatabaseEmbeddingRequested;
use App\Modules\DatabaseAnalyst\Jobs\Ask;
use App\Modules\DatabaseAnalyst\Models\Database;
use Override;

class DatabaseAnalystService extends BaseService
{
    public function model(): string
    {
        return Database::class;
    }

    public function embeddingRequestedEvent(): string
    {
        return DatabaseEmbeddingRequested::class;
    }

    public function askJob(): string
    {
        return Ask::class;
    }

    public function chatTurnRelation(): string
    {
        return 'databaseChatTurns';
    }

    public function askRoute(): string
    {
        return RouteEnum::Ask->value;
    }

    #[Override]
    public function userRelation(): string
    {
        return 'databases';
    }
}
