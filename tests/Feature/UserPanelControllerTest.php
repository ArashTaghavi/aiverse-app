<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('redirects guests from the user panel to sign in', function (string $routeName) {
    $this->get(route($routeName))->assertRedirect(route('auth'));
})->with(['user.index', 'user.chat-with-document.index', 'user.database-analyst.index']);

test('renders the user panel for authenticated users', function (string $routeName, string $component) {
    $user = User::factory()->make(['id' => 1]);

    $this->actingAs($user)->get(route($routeName))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component($component));
})->with([
    ['user.chat-with-document.index', 'user/chat-with-document/index'],
    ['user.database-analyst.index', 'user/database-analyst/index'],
]);

test('opens document chat directly when an authenticated user enters the panel', function () {
    $user = User::factory()->make(['id' => 1]);

    $this->actingAs($user)->get(route('user.index'))
        ->assertRedirect(route('user.chat-with-document.index'));
});
