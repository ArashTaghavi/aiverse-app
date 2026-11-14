<?php

namespace App\Modules\CustomerSupport\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Override;

#[Fillable([
    'title',
    'description',
    'price',
    'stock',
    'product_category_id',
    'image',
])]
class Product extends Model
{
    use SoftDeletes;

    public const uploadPath = 'products';

    #[Override]
    public function casts(): array
    {
        return [
            'price' => 'integer',
            'stock' => 'integer',
            'product_category_id' => 'integer',
        ];
    }

    public function productCategory(): BelongsTo
    {
        return $this->belongsTo(ProductCategory::class);
    }

    protected function imageUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => asset("uploads/{$this->image}"),
        );
    }
}
