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
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Inertia\Inertia;
use Inertia\Response;

class ChatWithDocumentController extends Controller
{
    public function __construct(private ChatWithDocumentService $service) {}

    public function index(Request $request): Response
    {
        $user = $request->user();

        $validated = $request->validate([
            'document_id' => ['nullable', 'integer', 'min:1'],
            'documents_page' => ['nullable', 'integer', 'min:1'],
            'history_page' => ['nullable', 'integer', 'min:1'],
        ]);
        $documentId = $validated['document_id'] ?? null;

        $document = $documentId
            ? $user->documents()->whereKey($request->integer('document_id'))->firstOrFail()
            : null;

        $documents = $this->service->documents($user);
        $history = $document?->documentChatTurns()->latest('id')
            ->simplePaginate(30, ['*'], 'history_page');
        $uploadedDocument = $request->session()->get('uploaded_document_id');

        return Inertia::render('user/chat-with-document/index', [
            'documents' => DocumentResource::collection($documents)->resolve($request),
            'documentsPagination' => [
                'page' => $documents->currentPage(),
                'hasMore' => $documents->hasMorePages(),
            ],
            'documentId' => $document?->id,
            'selectedDocument' => $document
                ? (new DocumentResource($document))->resolve($request)
                : null,
            'history' => DocumentChatTurnResource::collection(
                $history?->getCollection()->reverse()->values() ?? collect()
            )->resolve($request),
            'historyPagination' => [
                'page' => $history?->currentPage() ?? 1,
                'hasMore' => $history?->hasMorePages() ?? false,
            ],
            'uploadedDocument' => $uploadedDocument
                ? (new DocumentResource($user->documents()->findOrFail($uploadedDocument)))->resolve($request)
                : null,
        ]);
    }

    public function documents(Request $request): AnonymousResourceCollection
    {
        $request->validate(['documents_page' => ['nullable', 'integer', 'min:1']]);

        return DocumentResource::collection($this->service->documents($request->user()));
    }

    public function status(Document $relatedDocument): DocumentResource
    {
        return new DocumentResource($relatedDocument);
    }

    public function upload(UploadRequest $request): RedirectResponse
    {
        $document = $this->service->upload(
            file: $request->file('file'),
            title: $request->input('title'),
            ownerId: $request->user()->id
        );

        return back()->with('uploaded_document_id', $document->id);
    }

    public function ask(Document $relatedDocument, RequestsAskRequest $request): RedirectResponse
    {
        $this->service->ask(
            relatedDocument: $relatedDocument,
            question: $request->validated('question')
        );

        return to_route('user.chat-with-document.index', ['document_id' => $relatedDocument->id]);
    }
}
