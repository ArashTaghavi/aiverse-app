<?php

use App\Enums\ChatWithDocument\AnswerStatusEnum;
use App\Jobs\ChatWithDocument\ChatWithDocumentAsk;
use App\Models\ChatWithDocument\DocumentChatTurn;
use App\Models\User;
use Database\Factories\ChatWithDocument\DocumentFactory;
use Illuminate\Support\Facades\Queue;

test('stores a question for the owners document and redirects back after queuing the answer', function () {
    $user = User::factory()->create();
    $document = DocumentFactory::new()->for($user, 'owner')->create();
    Queue::fake([ChatWithDocumentAsk::class]);

    $response = $this->actingAs($user)->from(route('user.chat-with-document.index'))
        ->post(route('user.chat-with-document.ask'), ['document_id' => $document->id, 'question' => 'What is this document about?']);

    $response->assertRedirect(route('user.chat-with-document.index'))->assertSessionHasNoErrors();
    $this->assertDatabaseCount('document_chat_turns', 1);
    $turn = DocumentChatTurn::firstOrFail();
    expect($turn)->document_id->toBe($document->id)
        ->question->toBe('What is this document about?')
        ->answer_status->toBe(AnswerStatusEnum::Pending)
        ->answer->toBeNull();
    Queue::assertPushed(ChatWithDocumentAsk::class, fn (ChatWithDocumentAsk $job): bool => $job->documentChatTurn->id === $turn->id
        && $job->documentChatTurn->document->id === $document->id
        && $job->question === 'What is this document about?');
});

test('returns 401 when a guest submits a question', function () {
    Queue::fake();

    $this->postJson(route('user.chat-with-document.ask'), ['document_id' => 1, 'question' => 'Summarize it.'])->assertUnauthorized();

    $this->assertDatabaseCount('document_chat_turns', 0);
    Queue::assertNothingPushed();
});

test('returns 404 when asking about another users document', function () {
    $user = User::factory()->create();
    $document = DocumentFactory::new()->create();
    Queue::fake();

    $this->actingAs($user)->postJson(route('user.chat-with-document.ask'), [
        'document_id' => $document->id, 'question' => 'Summarize it.',
    ])->assertNotFound();

    $this->assertDatabaseCount('document_chat_turns', 0);
    Queue::assertNothingPushed();
});

test('returns 404 when asking about a deleted document', function () {
    $user = User::factory()->create();
    $document = DocumentFactory::new()->for($user, 'owner')->create(['deleted_at' => now()]);
    Queue::fake();

    $this->actingAs($user)->postJson(route('user.chat-with-document.ask'), [
        'document_id' => $document->id, 'question' => 'Summarize it.',
    ])->assertNotFound();

    $this->assertDatabaseCount('document_chat_turns', 0);
    Queue::assertNothingPushed();
});

test('returns 404 when the document does not exist', function () {
    $user = User::factory()->create();
    Queue::fake();

    $this->actingAs($user)->postJson(route('user.chat-with-document.ask'), [
        'document_id' => 99999, 'question' => 'Summarize it.',
    ])->assertNotFound();

    $this->assertDatabaseCount('document_chat_turns', 0);
    Queue::assertNothingPushed();
});

test('redirects invalid form submissions back with field errors and without queuing a job', function (array $payload, string $field) {
    $user = User::factory()->create();
    Queue::fake();

    $this->actingAs($user)->from(route('user.chat-with-document.index'))
        ->post(route('user.chat-with-document.ask'), $payload)
        ->assertRedirect(route('user.chat-with-document.index'))->assertSessionHasErrors($field);

    $this->assertDatabaseCount('document_chat_turns', 0);
    Queue::assertNothingPushed();
})->with([
    'missing document' => [['question' => 'Summarize it.'], 'document_id'],
    'invalid document' => [['document_id' => 'invalid', 'question' => 'Summarize it.'], 'document_id'],
    'negative document' => [['document_id' => -1, 'question' => 'Summarize it.'], 'document_id'],
    'missing question' => [['document_id' => 1], 'question'],
    'empty question' => [['document_id' => 1, 'question' => '   '], 'question'],
    'invalid question' => [['document_id' => 1, 'question' => ['not a string']], 'question'],
]);
