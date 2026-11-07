<?php

use App\Models\User;
use App\Modules\ChatWithDocument\Jobs\Ask;
use Database\Factories\DocumentFactory;
use Illuminate\Support\Facades\Queue;
use Inertia\Testing\AssertableInertia as Assert;

test('document selection page has no conversation props', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->get(route('user.chat-with-document.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Modules/ChatWithDocument/Pages/Index')
            ->has('documents', 0)
            ->missing('documentId')
            ->missing('selectedDocument')
            ->missing('history'));
});

test('document conversation is loaded by uuid', function () {
    $document = DocumentFactory::new()->create();

    $this->actingAs($document->owner)
        ->get(route('user.chat-with-document.show', ['relatedDocument' => $document->uuid]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Modules/ChatWithDocument/Pages/Show')
            ->where('selectedDocument.uuid', $document->uuid)
            ->has('history', 0)
            ->missing('documentId'));
});

test('another users document conversation returns not found', function () {
    $document = DocumentFactory::new()->create();
    $otherUser = User::factory()->create();

    $this->actingAs($otherUser)
        ->get(route('user.chat-with-document.show', ['relatedDocument' => $document->uuid]))
        ->assertNotFound();
});

test('numeric document ids cannot open a conversation', function () {
    $document = DocumentFactory::new()->create();

    $this->actingAs($document->owner)
        ->get(route('user.chat-with-document.show', ['relatedDocument' => $document->id]))
        ->assertNotFound();
});

test('missing document uuid returns not found', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('user.chat-with-document.show', ['relatedDocument' => '00000000-0000-4000-8000-000000000000']))
        ->assertNotFound();
});

test('document conversation requires authentication', function () {
    $document = DocumentFactory::new()->create();

    $this->get(route('user.chat-with-document.show', ['relatedDocument' => $document->uuid]))
        ->assertRedirect(route('auth'));
});

test('asking a question redirects to the uuid conversation', function () {
    $document = DocumentFactory::new()->create();
    Queue::fake([Ask::class]);

    $this->actingAs($document->owner)
        ->post(route('user.chat-with-document.ask', ['relatedDocument' => $document->uuid]), [
            'question' => 'What does the document contain?',
        ])
        ->assertRedirect(route('user.chat-with-document.show', ['relatedDocument' => $document->uuid]));

    $this->assertDatabaseHas('document_chat_turns', [
        'document_id' => $document->id,
        'question' => 'What does the document contain?',
        'answer_status' => 'PENDING',
    ]);
    Queue::assertPushed(Ask::class, fn (Ask $job): bool => $job->documentChatTurn->document_id === $document->id);
});
