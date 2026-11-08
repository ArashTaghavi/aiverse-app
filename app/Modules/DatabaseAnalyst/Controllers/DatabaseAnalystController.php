<?php

namespace App\Modules\DatabaseAnalyst\Controllers;

use App\Modules\Base\Controllers\BaseController;
use App\Modules\DatabaseAnalyst\Requests\UploadRequest;
use App\Modules\DatabaseAnalyst\Resources\DatabaseChatTurnResource;
use App\Modules\DatabaseAnalyst\Resources\DatabaseResource;
use App\Modules\DatabaseAnalyst\Services\DatabaseAnalystService;

class DatabaseAnalystController extends BaseController
{
    public function __construct(DatabaseAnalystService $service)
    {
        parent::__construct($service);
    }

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
        return 'Modules/DatabaseAnalyst/Pages/Index';
    }

    protected function uploadRequest(): string
    {
        return UploadRequest::class;
    }
}
