<?php

use App\Enums\ChatWithDocument\DocumentEmbeddingStatusEnum;
use App\Models\User;
use Database\Factories\ChatWithDocument\DocumentChatTurnFactory;
use Database\Factories\ChatWithDocument\DocumentFactory;
use Inertia\Testing\AssertableInertia as Assert;

test('returns 401 when a guest requests documents', function () {
    $this->getJson(route('user.chat-with-document.documents'))->assertUnauthorized();
});

test('renders the owners document list and latest message previews in the chat page', function () {
    $user = User::factory()->create();
    $document = DocumentFactory::new()->for($user, 'owner')->create([
        'title' => 'Learning notes', 'last_message' => 'Explain the last section.',
    ]);
    DocumentFactory::new()->create();

    $this->actingAs($user)->get(route('user.chat-with-document.index'))
        ->assertOk()->assertInertia(fn (Assert $page) => $page
        ->component('user/chat-with-document/index')
        ->has('documents', 1)
        ->where('documents.0.id', $document->id)
        ->where('documents.0.title', 'Learning notes')
        ->where('documents.0.last_message', 'Explain the last section.')
        ->where('documentId', null)->where('selectedDocument', null)->has('history', 0));
});

test('opens the selected document and only its ordered message history', function () {
    $user = User::factory()->create();
    $document = DocumentFactory::new()->for($user, 'owner')->create();
    $first = DocumentChatTurnFactory::new()->for($document, 'document')->create(['question' => 'First question']);
    $second = DocumentChatTurnFactory::new()->for($document, 'document')->create(['question' => 'Next question']);
    DocumentChatTurnFactory::new()->create();

    $this->actingAs($user)->get(route('user.chat-with-document.index', ['document_id' => $document->id]))
        ->assertOk()->assertInertia(fn (Assert $page) => $page
        ->component('user/chat-with-document/index')
        ->where('documentId', (string) $document->id)
        ->where('selectedDocument.id', $document->id)
        ->where('selectedDocument.title', $document->title)
        ->where('selectedDocument.embedding_status', 'COMPLETED')
        ->has('history', 2)
        ->where('history.0.id', $first->id)->where('history.1.id', $second->id));
});

test('returns 404 when selecting another users document in the chat page', function () {
    $user = User::factory()->create();
    $document = DocumentFactory::new()->create();

    $this->actingAs($user)->get(route('user.chat-with-document.index', ['document_id' => $document->id]))
        ->assertNotFound();
});

test('rejects a malformed document selection with a validation error', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->getJson(route('user.chat-with-document.index', ['document_id' => 'invalid']))
        ->assertUnprocessable()->assertJsonValidationErrors('document_id');
});

test('returns an empty document list when the user has no documents', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->getJson(route('user.chat-with-document.documents'))
        ->assertOk()->assertExactJson(['data' => []]);
});

test('lists only the owners active documents newest first including processing documents', function () {
    $user = User::factory()->create();
    $older = DocumentFactory::new()->for($user, 'owner')->create(['title' => 'First document']);
    $newer = DocumentFactory::new()->for($user, 'owner')->create([
        'title' => 'New document', 'embedding_status' => DocumentEmbeddingStatusEnum::Pending,
    ]);
    $other = DocumentFactory::new()->create();
    DocumentFactory::new()->for($user, 'owner')->create(['deleted_at' => now()]);

    $this->actingAs($user)->getJson(route('user.chat-with-document.documents', ['owner_id' => $other->owner_id]))
        ->assertOk()->assertJsonCount(2, 'data')
        ->assertJsonPath('data.0.id', $newer->id)
        ->assertJsonPath('data.0.title', 'New document')
        ->assertJsonPath('data.0.embedding_status', 'PENDING')
        ->assertJsonPath('data.1.id', $older->id)
        ->assertJsonPath('data.1.embedding_status', 'COMPLETED')
        ->assertJsonStructure(['data' => [['id', 'title', 'original_name', 'size', 'last_message', 'embedding_status', 'created_at']]])
        ->assertJsonMissingPath('data.0.storage_path')
        ->assertJsonMissingPath('data.0.owner_id');
});
