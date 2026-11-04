<?php

namespace App\Modules\Base\Traits;

use Illuminate\Database\Eloquent\SoftDeletes;

trait HasEmbeddableFile
{
    abstract public static function uploadPath(): string;

    use HasEmbeddingStatus,
        HasFile,
        HasHumanReadableSize,
        HasOwner,
        HasUuid,
        SoftDeletes;
}
