<?php

namespace App\Modules\CustomerSupport\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Override;

#[Fillable([
    'title',
    'product_count',
])]
class ProductCategory extends Model
{
    use SoftDeletes;

    #[Override]
    public function casts(): array
    {
        return [
            'product_count' => 'integer',
        ];
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }
}
