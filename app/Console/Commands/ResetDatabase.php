<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

#[Signature('app:reset-database')]
#[Description('Empty every table except users while preserving table structures')]
class ResetDatabase extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $connection = DB::connection();

        $schema = $connection->getSchemaBuilder();
        $tables = array_values(array_filter(
            $schema->getTables(),
            fn (array $table): bool => $table['name'] !== 'users',
        ));

        if ($tables === []) {
            $this->components->info('No tables to empty.');

            return self::SUCCESS;
        }

        if ($connection->getDriverName() === 'pgsql') {
            $grammar = $connection->getQueryGrammar();
            $names = array_map(
                fn (array $table): string => $grammar->wrap($table['schema']).'.'.$grammar->wrap($table['name']),
                $tables,
            );

            // Truncate together without CASCADE so users can never be included implicitly.
            $connection->statement('TRUNCATE TABLE '.implode(', ', $names).' RESTART IDENTITY RESTRICT');
        } else {
            $schema->withoutForeignKeyConstraints(function () use ($connection, $tables): void {
                foreach ($tables as $table) {
                    $connection->table($table['schema_qualified_name'])->truncate();
                }
            });
        }

        $this->components->info('All tables except users have been emptied.');

        return self::SUCCESS;
    }
}
