<?php

namespace App\Modules\ChatWithDocument\Services;

use App\Modules\Base\Services\BaseService;
use App\Modules\ChatWithDocument\Enums\RouteEnum;
use App\Modules\ChatWithDocument\Events\DocumentEmbeddingRequested;
use App\Modules\ChatWithDocument\Jobs\Ask;
use App\Modules\ChatWithDocument\Models\Document;

class ChatWithDocumentService extends BaseService
{
    public function model(): string
    {
        return Document::class;
    }

    public function embeddingRequestedEvent(): string
    {
        return DocumentEmbeddingRequested::class;
    }

    public function askJob(): string
    {
        return Ask::class;
    }

    public function chatTurnRelation(): string
    {
        return 'documentChatTurns';
    }

    public function askRoute(): string
    {
        return RouteEnum::Ask->value;
    }

    public function userRelation(): string
    {
        return 'documents';
    }
}
