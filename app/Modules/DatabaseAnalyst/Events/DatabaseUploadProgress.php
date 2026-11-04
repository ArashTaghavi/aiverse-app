<?php

namespace App\Modules\DatabaseAnalyst\Events;

use App\Modules\Base\Events\BaseUploadProgress;
use App\Modules\DatabaseAnalyst\Enums\EventEnum;
use App\Modules\DatabaseAnalyst\Module;

class DatabaseUploadProgress extends BaseUploadProgress
{
    protected function channelPrefix(): string
    {
        return Module::CHANNEL_PREFIX;
    }

    public function broadcastAs(): string
    {
        return EventEnum::UPLOAD_PROGRESS->value;
    }
}
