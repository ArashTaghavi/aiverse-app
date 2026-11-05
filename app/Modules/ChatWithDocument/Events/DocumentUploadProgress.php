<?php

namespace App\Modules\ChatWithDocument\Events;

use App\Modules\Base\Events\BaseUploadProgress;
use App\Modules\ChatWithDocument\Enums\EventEnum;
use App\Modules\ChatWithDocument\Module;
use Override;

class DocumentUploadProgress extends BaseUploadProgress
{
    #[Override]
    protected function channelPrefix(): string
    {
        return Module::CHANNEL_PREFIX;
    }

    public function broadcastAs(): string
    {
        return EventEnum::UPLOAD_PROGRESS->value;
    }
}
