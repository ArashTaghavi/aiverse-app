<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('renders authentication previews for guests', function (string $routeName, string $component) {
    $response = $this->get(route($routeName));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component($component));
})->with([
    'auth' => ['auth', 'auth/index'],
]);

test('preview submissions do not authenticate or create accounts', function (string $routeName, string $redirect, string $message) {
    $user = User::factory()->create();

    $response = $this->post(route($routeName), [
        'username' => 'preview-user',
        'email' => $user->email,
        'password' => 'password',
    ]);

    $response->assertRedirect(route($redirect))
        ->assertSessionHasErrors(['auth' => $message])
        ->assertSessionMissing('_old_input.password');
    $this->assertGuest();
    $this->assertDatabaseCount('users', 1);
})->with([
    'login' => ['login.store', 'auth', 'This is a preview. Sign in has not been implemented yet.'],
    'register' => ['register.store', 'auth', 'This is a preview. Registration has not been implemented yet.'],
]);
