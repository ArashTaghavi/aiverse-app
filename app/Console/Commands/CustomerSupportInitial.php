<?php

namespace App\Console\Commands;

use App\Modules\CustomerSupport\Database\Seeders\ProductCategorySeeder;
use App\Modules\CustomerSupport\Database\Seeders\ProductSeeder;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('customer-support:initial')]
#[Description('Seed customer support product categories and products')]
class CustomerSupportInitial extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $exitCode = $this->call('db:seed', ['--class' => ProductCategorySeeder::class]);

        if ($exitCode !== self::SUCCESS) {
            return $exitCode;
        }

        return $this->call('db:seed', ['--class' => ProductSeeder::class]);
    }
}
