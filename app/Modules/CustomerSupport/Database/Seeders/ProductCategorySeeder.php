<?php

namespace App\Modules\CustomerSupport\Database\Seeders;

use App\Modules\CustomerSupport\Models\ProductCategory;
use Illuminate\Database\Seeder;

class ProductCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $records = [
            'Mobile and Tablets',
            'Laptop and Computers',
            'Gaming & Consoles',
            'Digital Accessories',
        ];

        foreach ($records as $record) {
            ProductCategory::create(['title' => $record]);
        }
    }
}
