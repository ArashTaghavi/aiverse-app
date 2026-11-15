<?php

use App\Models\User;
use App\Modules\CustomerSupport\Controllers\CustomerSupportController;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;

test('forwards support confirmation decisions with the authenticated identity', function (bool $confirmed) {
    $user = User::factory()->create();
    Http::preventStrayRequests();
    Http::fake(['*' => Http::response(['thread_id' => 'thread-1', 'status' => 'completed', 'message' => 'Done', 'blocks' => []])]);
    $confirmation = ['interrupt_id' => 'interrupt-1', 'confirmed' => $confirmed];

    $this->actingAs($user)->postJson(action([CustomerSupportController::class, 'ask']), [
        'user_id' => 999, 'thread_id' => 'thread-1', 'confirmation' => $confirmation,
    ])->assertOk()->assertJsonPath('status', 'completed');

    Http::assertSent(fn (Request $request) => $request->data() === [
        'user_id' => $user->id, 'thread_id' => 'thread-1', 'confirmation' => $confirmation,
    ]);
})->with([true, false]);

test('returns the pending confirmation and conversation id for a question', function () {
    Http::fake(['*' => Http::response([
        'thread_id' => 'thread-1', 'status' => 'confirmation_required', 'message' => 'Confirm?', 'blocks' => [],
        'interrupts' => [['interrupt_id' => 'interrupt-1', 'data' => ['order_id' => 12]]],
    ])]);

    $this->actingAs(User::factory()->create())->postJson(action([CustomerSupportController::class, 'ask']), [
        'question' => 'Cancel order 12',
    ])->assertOk()->assertJsonPath('interrupts.0.interrupt_id', 'interrupt-1')->assertJsonPath('thread_id', 'thread-1');

    Http::assertSent(fn (Request $request) => $request['question'] === 'Cancel order 12' && ! isset($request['confirmation']));
});

test('rejects invalid confirmation payloads before contacting AI', function (array $payload, string $field) {
    Http::fake();
    $this->actingAs(User::factory()->create())->postJson(action([CustomerSupportController::class, 'ask']), $payload)
        ->assertUnprocessable()->assertJsonValidationErrors($field);
    Http::assertNothingSent();
})->with([
    'missing action' => [[], 'question'],
    'missing thread' => [['confirmation' => ['interrupt_id' => 'i', 'confirmed' => true]], 'thread_id'],
    'missing decision' => [['thread_id' => 't', 'confirmation' => ['interrupt_id' => 'i']], 'confirmation.confirmed'],
    'nonboolean decision' => [['thread_id' => 't', 'confirmation' => ['interrupt_id' => 'i', 'confirmed' => 'true']], 'confirmation.confirmed'],
    'missing interrupt' => [['thread_id' => 't', 'confirmation' => ['confirmed' => true]], 'confirmation.interrupt_id'],
    'mixed actions' => [['question' => 'hello', 'thread_id' => 't', 'confirmation' => ['interrupt_id' => 'i', 'confirmed' => true]], 'question'],
    'client order id' => [['thread_id' => 't', 'confirmation' => ['interrupt_id' => 'i', 'confirmed' => true, 'order_id' => 999]], 'confirmation'],
]);

test('preserves stale confirmation errors from AI', function () {
    Http::fake(['*' => Http::response(['detail' => 'No longer pending'], 409)]);
    $this->actingAs(User::factory()->create())->postJson(action([CustomerSupportController::class, 'ask']), [
        'thread_id' => 't', 'confirmation' => ['interrupt_id' => 'i', 'confirmed' => true],
    ])->assertConflict()->assertJsonStructure(['message']);
    Http::assertSentCount(1);
});

test('requires authentication for support requests', function () {
    Http::fake();
    $this->postJson(action([CustomerSupportController::class, 'ask']), ['question' => 'Hello'])->assertUnauthorized();
    Http::assertNothingSent();
});
