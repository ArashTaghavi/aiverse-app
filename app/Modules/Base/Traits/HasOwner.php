<?php

namespace App\Modules\Base\Traits;

use App\Models\User;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

trait HasOwner
{
    protected function ownerColumn(): string
    {
        return 'owner_id';
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, $this->ownerColumn());
    }
}
