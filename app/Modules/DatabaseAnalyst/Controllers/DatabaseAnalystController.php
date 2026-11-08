<?php

namespace App\Modules\DatabaseAnalyst\Controllers;

use App\Modules\Base\Controllers\BaseController;
use App\Modules\DatabaseAnalyst\Requests\UploadRequest;
use App\Modules\DatabaseAnalyst\Resources\DatabaseChatTurnResource;
use App\Modules\DatabaseAnalyst\Resources\DatabaseResource;

class DatabaseAnalystController extends BaseController
{
    public function resource(): string
    {
        return DatabaseResource::class;
    }

    public function chatTurnResource(): string
    {
        return DatabaseChatTurnResource::class;
    }

    public function view(): string
    {
        return 'Module/DatabaseAnalyst/Pages/Index';
    }

    protected function uploadRequest(): string
    {
        return UploadRequest::class;
    }
}
