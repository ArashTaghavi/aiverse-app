<?php

use App\Http\Middleware\HandleInertiaRequests;
use App\Models\User;
use App\Modules\ChatWithDocument\Enums\AnswerStatusEnum;
use App\Modules\ChatWithDocument\Events\AskCompleted;
use App\Modules\ChatWithDocument\Events\AskFailed;
use App\Modules\ChatWithDocument\Jobs\Ask;
use App\Modules\ChatWithDocument\Models\Document;
use App\Services\AIClient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->document = Document::create([
        'owner_id' => $this->user->id,
        'title' => 'Notes',
        'original_name' => 'notes.docx',
        'storage_path' => 'notes.docx',
        'mime_type' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'extension' => 'docx',
        'size' => 100,
    ]);
    $this->turn = $this->document->documentChatTurns()->create([
        'question' => 'Summarize these notes.',
        'answer_status' => AnswerStatusEnum::Pending,
    ]);
});

test('persists the answer and broadcasts completion on the authorized user channel', function () {
    Event::fake([AskCompleted::class, AskFailed::class]);
    Http::preventStrayRequests();
    $url = rtrim(config('ai.url'), '/').'/chat-with-document/ask';
    Http::fake([$url => Http::response('The notes describe a project.', 200, ['Content-Type' => 'text/plain'])]);

    (new Ask($this->turn))->handle(app(AIClient::class));

    expect($this->turn->fresh()->answer)->toBe('The notes describe a project.');
    Event::assertDispatched(AskCompleted::class, fn (AskCompleted $event): bool => $event->broadcastOn()[0]->name === 'private-chat-with-document.users.'.$this->user->id
        && $event->broadcastAs() === 'chat-with-document.answer.completed'
        && $event->broadcastWith()['document_id'] === $this->document->id
        && $event->broadcastWith()['answer_status'] === AnswerStatusEnum::Completed
    );
    Event::assertNotDispatched(AskFailed::class);
});

test('broadcasts terminal failures on the same authorized user channel', function () {
    Event::fake([AskFailed::class]);

    (new Ask($this->turn))->failed(new RuntimeException('AI unavailable'));

    expect($this->turn->fresh()->answer_status)->toBe(AnswerStatusEnum::Failed);
    expect($this->turn->fresh()->answer_error)->toBe('AI unavailable');
    Event::assertDispatched(AskFailed::class, fn (AskFailed $event): bool => $event->broadcastOn()[0]->name === 'private-chat-with-document.users.'.$this->user->id
        && $event->broadcastAs() === 'chat-with-document.answer.failed'
        && $event->broadcastWith()['document_id'] === $this->document->id
        && $event->broadcastWith()['answer_status'] === AnswerStatusEnum::Failed
    );
});

test('returns the completed answer in an inertia partial history reload', function () {
    $this->turn->markAsCompleted('The completed answer.');

    $this->actingAs($this->user)->get(route('user.chat-with-document.index', ['document_id' => $this->document->id]), [
        'X-Inertia' => 'true',
        'X-Inertia-Version' => app(HandleInertiaRequests::class)->version(Request::create('/')),
        'X-Inertia-Partial-Component' => 'user/chat-with-document/index',
        'X-Inertia-Partial-Data' => 'history,documents',
    ])->assertOk()
        ->assertJsonPath('props.history.0.answer', 'The completed answer.')
        ->assertJsonPath('props.history.0.answer_status', 'COMPLETED');
});
