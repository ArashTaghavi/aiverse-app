<?php

namespace App\Modules\Base\Traits;

use Illuminate\Database\Eloquent\Casts\Attribute;

trait HasHumanReadableSize
{
    protected function sizeColumn(): string
    {
        return 'size';
    }

    protected function humanSize(): Attribute
    {
        return Attribute::get(function () {
            $size = $this->{$this->sizeColumn()};

            return match (true) {
                $size < 1024 => $size.' Bytes',
                $size < 1024 ** 2 => round($size / 1024, 2).' KB',
                $size < 1024 ** 3 => round($size / 1024 ** 2, 2).' MB',
                default => round($size / 1024 ** 3, 2).' GB',
            };
        });
    }
}
