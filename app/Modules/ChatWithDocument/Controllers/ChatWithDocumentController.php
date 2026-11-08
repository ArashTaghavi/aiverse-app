<?php

namespace App\Modules\ChatWithDocument\Controllers;

use App\Modules\Base\Controllers\BaseController;
use App\Modules\ChatWithDocument\Requests\UploadRequest;
use App\Modules\ChatWithDocument\Resources\DocumentChatTurnResource;
use App\Modules\ChatWithDocument\Resources\DocumentResource;

class ChatWithDocumentController extends BaseController
{
    public function resource(): string
    {
        return DocumentResource::class;
    }

    public function chatTurnResource(): string
    {
        return DocumentChatTurnResource::class;
    }

    public function view(): string
    {
        return 'Module/ChatWithDocument/Pages/Index';
    }

    protected function uploadRequest(): string
    {
        return UploadRequest::class;
    }
}
