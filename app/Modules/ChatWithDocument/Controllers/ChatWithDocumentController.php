<?php

namespace App\Modules\ChatWithDocument\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Base\Requests\AskRequest as RequestsAskRequest;
use App\Modules\ChatWithDocument\Models\Document;
use App\Modules\ChatWithDocument\Requests\UploadRequest;
use App\Modules\ChatWithDocument\Resources\DocumentChatTurnResource;
use App\Modules\ChatWithDocument\Resources\DocumentResource;
use App\Modules\ChatWithDocument\Services\ChatWithDocumentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ChatWithDocumentController extends Controller
{
    public function __construct(private ChatWithDocumentService $service) {}

    public function index(Request $request): Response
    {
        $user = $request->user();

        $documentId = $request->validate([
            'document_id' => ['nullable', 'integer', 'min:1'],
        ])['document_id'] ?? null;

        $document = $documentId
            ? $user->documents()->findOrFail($documentId)
            : null;

        $documents = DocumentResource::collection($this->service->documents($user))->resolve($request);

        $history = DocumentChatTurnResource::collection(
            $document?->documentChatTurns()
                ->oldest('id')
                ->get() ?? collect()
        )->resolve($request);

        return Inertia::render('user/chat-with-document/index', [
            'documents' => $documents,
            'documentId' => $document?->id,
            'selectedDocument' => $document
                ? (new DocumentResource($document))->resolve($request)
                : null,
            'history' => $history,
        ]);
    }

    public function upload(UploadRequest $request): RedirectResponse
    {
        $this->service->upload(
            file: $request->file('file'),
            title: $request->input('title'),
            ownerId: auth()->id()
        );

        return back();
    }

    public function ask(Document $relatedDocument, RequestsAskRequest $request): RedirectResponse
    {
        $this->service->ask(
            relatedDocument: $relatedDocument,
            question: $request->validated('question')
        );

        return back();
    }
}
