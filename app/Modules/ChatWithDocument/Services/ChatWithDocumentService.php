<?php

namespace App\Modules\ChatWithDocument\Services;

use App\Modules\Base\Services\BaseService;
use App\Modules\ChatWithDocument\Enums\RouteEnum;
use App\Modules\ChatWithDocument\Events\AskCompleted;
use App\Modules\ChatWithDocument\Events\AskFailed;
use App\Modules\ChatWithDocument\Events\DocumentEmbeddingRequested;
use App\Modules\ChatWithDocument\Events\DocumentUploadProgress;
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

    public function uploadProgressEvent(): string
    {
        return DocumentUploadProgress::class;
    }

    public function chatTurnParentRelation(): string
    {
        return 'document';
    }

    public function answerCompletedEvent(): string
    {
        return AskCompleted::class;
    }

    public function answerFailedEvent(): string
    {
        return AskFailed::class;
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
