<?php

use Inertia\Testing\AssertableInertia as Assert;

test('renders the public site pages for guests', function (string $routeName, string $component) {
    $response = $this->get(route($routeName));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component($component));
})->with([
    'home' => ['home', 'site/index'],
    'portfolio' => ['portfolio', 'site/portfolio/index'],
]);
