<?php

namespace App\Modules\Base\Traits;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Support\Facades\Storage;

trait HasFile
{
    public function absolutePath(): Attribute
    {
        // TODO
        return Attribute::get(
            fn () => Storage::disk('local')->path($this->storage_path)
        );
    }
}
