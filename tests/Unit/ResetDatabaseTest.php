<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

uses(TestCase::class);

beforeEach(function () {
    config(['database.default' => 'sqlite', 'database.connections.sqlite.database' => ':memory:']);
    DB::purge('sqlite');

    foreach (['users', 'migrations', 'reset_documents', 'reset_messages'] as $table) {
        Schema::create($table, function (Blueprint $table) {
            $table->id();
            $table->string('name');
        });
        DB::table($table)->insert(['name' => 'Keep or reset']);
    }
});

afterEach(function () {
    DB::purge('sqlite');
});

test('empties all tables including migrations while preserving users', function () {
    $this->artisan('app:reset-database')->assertSuccessful();

    expect(DB::table('users')->value('name'))->toBe('Keep or reset')
        ->and(DB::table('migrations')->count())->toBe(0)
        ->and(DB::table('reset_documents')->count())->toBe(0)
        ->and(DB::table('reset_messages')->count())->toBe(0)
        ->and(Schema::hasColumn('reset_documents', 'name'))->toBeTrue()
        ->and(DB::table('reset_documents')->insertGetId(['name' => 'New']))->toBe(1);
});

test('discovers newly added tables automatically', function () {
    Schema::create('another_table', function (Blueprint $table) {
        $table->id();
    });
    DB::table('another_table')->insert(['id' => 1]);
    $this->artisan('app:reset-database')->assertSuccessful();

    expect(DB::table('another_table')->count())->toBe(0)
        ->and(DB::table('users')->count())->toBe(1);
});

test('can reset twice without modifying users', function () {
    $this->artisan('app:reset-database')->assertSuccessful();
    $this->artisan('app:reset-database')->assertSuccessful();

    expect(DB::table('reset_documents')->count())->toBe(0)
        ->and(DB::table('users')->count())->toBe(1)
        ->and(DB::table('users')->value('name'))->toBe('Keep or reset');
});
