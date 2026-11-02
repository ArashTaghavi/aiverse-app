<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\ChatWithDocument\ChatWithDocumentAskRequest;
use App\Http\Requests\ChatWithDocument\ChatWithDocumentUploadRequest;
use App\Http\Resources\ChatWithDocument\ChatWithDocumentChatTurnMinifyResource;
use App\Http\Resources\ChatWithDocument\ChatWithDocumentMinifyResource;
use App\Services\ChatWithDocumentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Inertia\Inertia;
use Inertia\Response;

class ChatWithDocumentController extends Controller
{
    public function __construct(private ChatWithDocumentService $service) {}

    public function index(Request $request): Response
    {
        $documentId = $request->validate(['document_id' => ['nullable', 'integer', 'min:1']])['document_id'] ?? null;
        $document = $documentId ? $request->user()->documents()->findOrFail($documentId) : null;

        return Inertia::render('user/chat-with-document/index', [
            'documents' => ChatWithDocumentMinifyResource::collection(
                $this->service->documents($request->user())
            )->resolve($request),
            'documentId' => $document ? (string) $document->id : null,
            'selectedDocument' => $document ? (new ChatWithDocumentMinifyResource($document))->resolve($request) : null,
            'history' => ChatWithDocumentChatTurnMinifyResource::collection(
                $document ? $document->documentChatTurns()->oldest('id')->get() : collect()
            )->resolve($request),
        ]);
    }

    public function upload(ChatWithDocumentUploadRequest $request): RedirectResponse
    {
        $result = $this->service->upload(
            file: $request->file('file'),
            title: $request->input('title'),
            ownerId: auth()->id()
        );

        return back();

        return new ChatWithDocumentMinifyResource($result);
    }

    public function ask(ChatWithDocumentAskRequest $request): RedirectResponse
    {
        $document = $request->user()->documents()->findOrFail($request->validated('document_id'));

        $this->service->ask(
            document: $document,
            question: $request->validated('question')
        );

        return back();
    }

    public function documents(Request $request): AnonymousResourceCollection
    {
        return ChatWithDocumentMinifyResource::collection(
            $this->service->documents($request->user())
        );
    }
}
