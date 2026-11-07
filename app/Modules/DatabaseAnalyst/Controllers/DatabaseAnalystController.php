<?php

namespace App\Modules\DatabaseAnalyst\Controllers;

use App\Modules\Base\Controllers\BaseController;
use App\Modules\DatabaseAnalyst\Models\Database;
use App\Modules\DatabaseAnalyst\Models\DatabaseChatTurn;
use App\Modules\DatabaseAnalyst\Requests\UploadRequest;
use App\Modules\DatabaseAnalyst\Resources\DatabaseResource;
use App\Modules\DatabaseAnalyst\Services\DatabaseAnalystService;

class DatabaseAnalystController extends BaseController
{
    public function __construct(private DatabaseAnalystService $service) {}

    public function model(): string
    {
        return Database::class;
    }

    public function relation(): string
    {
        return DatabaseChatTurn::class;
    }

    public function resource(): string
    {
        return DatabaseResource::class;
    }

    public function chatTurnRelation(): string
    {
        return DatabaseChatTurn::class;
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
