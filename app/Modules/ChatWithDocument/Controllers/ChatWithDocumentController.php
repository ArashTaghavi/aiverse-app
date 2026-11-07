<?php

namespace App\Modules\ChatWithDocument\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Base\Requests\AskRequest as RequestsAskRequest;
use App\Modules\ChatWithDocument\Models\Document;
use App\Modules\ChatWithDocument\Requests\UploadRequest;
use App\Modules\ChatWithDocument\Resources\DocumentChatTurnResource;
use App\Modules\ChatWithDocument\Resources\DocumentResource;
use App\Modules\ChatWithDocument\Services\ChatWithDocumentService;
use Generator;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Throwable;

class ChatWithDocumentController extends Controller
{
    public function __construct(private ChatWithDocumentService $service) {}

    public function index(Request $request): Response
    {
        $user = $request->user();

        $request->validate([
            'documents_page' => ['nullable', 'integer', 'min:1'],
        ]);

        $documents = $this->service->documents($user);
        $uploadedDocument = $request->session()->get('uploaded_document_id');

        return Inertia::render('Modules/ChatWithDocument/Pages/Index', [
            'documents' => DocumentResource::collection($documents)->resolve($request),
            'documentsPagination' => [
                'page' => $documents->currentPage(),
                'hasMore' => $documents->hasMorePages(),
            ],
            'uploadedDocument' => $uploadedDocument
                ? (new DocumentResource($user->documents()->findOrFail($uploadedDocument)))->resolve($request)
                : null,
        ]);
    }

    public function show(Request $request, Document $relatedDocument): Response
    {
        $request->validate([
            'documents_page' => ['nullable', 'integer', 'min:1'],
            'history_page' => ['nullable', 'integer', 'min:1'],
        ]);

        $documents = $this->service->documents($request->user());
        $history = $relatedDocument->documentChatTurns()->latest('id')
            ->simplePaginate(30, ['*'], 'history_page');

        return Inertia::render('Modules/ChatWithDocument/Pages/Show', [
            'documents' => DocumentResource::collection($documents)->resolve($request),
            'documentsPagination' => [
                'page' => $documents->currentPage(),
                'hasMore' => $documents->hasMorePages(),
            ],
            'selectedDocument' => (new DocumentResource($relatedDocument))->resolve($request),
            'history' => DocumentChatTurnResource::collection(
                $history->getCollection()->reverse()->values()
            )->resolve($request),
            'historyPagination' => [
                'page' => $history->currentPage(),
                'hasMore' => $history->hasMorePages(),
            ],
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

    public function ask(Document $relatedDocument, RequestsAskRequest $request): StreamedResponse
    {

        $turn = $this->service->ask(
            relatedDocument: $relatedDocument,
            question: $request->validated('question')
        );

        $chunks = $this->service->streamAnswer($turn);

        try {
            // Detect upstream failures before committing the streaming headers.
            $chunks->rewind();
        } catch (Throwable $exception) {
            report($exception);
            abort(502, 'The AI service could not generate an answer.');
        }

        return response()->stream(function () use ($chunks): Generator {
            try {
                yield from $chunks;
            } catch (Throwable $exception) {
                // The status is already sent; keep error details out of the answer.
                report($exception);
            }
        }, headers: [
            'Content-Type' => 'text/plain; charset=utf-8',
            'Cache-Control' => 'no-cache, no-transform',
            'X-Accel-Buffering' => 'no',
            'X-Chat-Turn-Id' => (string) $turn->id,
        ]);
    }
}
