<?php

namespace App\Modules\Base\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Base\Requests\AskRequest;
use App\Modules\Base\Services\BaseService;
use Generator;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Throwable;

abstract class BaseController extends Controller
{
    public function __construct(protected BaseService $service) {}

    abstract protected function resource(): string;

    abstract protected function chatTurnResource(): string;

    abstract protected function view(): string;

    abstract protected function uploadRequest(): string;

    public function index(Request $request): Response
    {
        $request->validate([
            'page' => ['nullable', 'integer', 'min:1'],
        ]);

        $resource = $this->resource();

        [$data,$uploadedRecord] = $this->service->index(request: $request);

        return Inertia::render($this->view(), [
            'data' => $resource::collection($data)->resolve($request),
            'pagination' => [
                'page' => $data->currentPage(),
                'hasMore' => $data->hasMorePages(),
            ],
            'uploadedRecord' => $uploadedRecord !== null
                ? (new $resource($uploadedRecord))->resolve($request)
                : null,
        ]);
    }

    public function show(Request $request, Model $relatedModel): Response
    {
        $request->validate([
            'page' => ['nullable', 'integer', 'min:1'],
            'history_page' => ['nullable', 'integer', 'min:1'],
        ]);

        $resource = $this->resource();
        $chatTurnResource = $this->chatTurnResource();

        [$data,$history] = $this->service->show(request: $request, relatedModel: $relatedModel);

        return Inertia::render(str_replace('Index', 'Show', $this->view()), [
            'data' => $resource::collection($data)->resolve($request),

            'pagination' => [
                'page' => $data->currentPage(),
                'hasMore' => $data->hasMorePages(),
            ],

            'selectedData' => (new $resource($relatedModel))->resolve($request),

            'history' => $chatTurnResource::collection(
                $history->getCollection()->reverse()->values()
            )->resolve($request),

            'historyPagination' => [
                'page' => $history->currentPage(),
                'hasMore' => $history->hasMorePages(),
            ],
        ]);
    }

    public function status(Model $relatedModel): JsonResource
    {
        $resource = $this->resource();

        return new $resource($relatedModel);
    }

    public function upload(Request $request): RedirectResponse
    {
        $formRequest = app($this->uploadRequest());

        $data = $this->service->upload(
            file: $formRequest->file('file'),
            title: $formRequest->validated('title'),
            ownerId: $request->user()->id,
        );

        return back()->with('uploaded_record_id', $data->id);
    }

    public function ask(Model $relatedModel, AskRequest $request): StreamedResponse
    {
        $turn = $this->service->ask(
            entity: $relatedModel,
            question: $request->validated('question')
        );

        $chunks = $this->service->streamAnswer($turn);

        try {
            // Detect upstream failures before committing the streaming headers.
            $chunks->rewind();
        } catch (Throwable $exception) {
            report($exception);
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
