<?php

namespace App\Modules\Base\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Base\Services\BaseService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

abstract class BaseController extends Controller
{
    public function __construct(private BaseService $service) {}

    abstract protected function model(): string;

    abstract protected function relation(): string;

    abstract protected function resource(): string;

    abstract protected function chatTurnRelation(): string;

    abstract protected function view(): string;

    abstract protected function uploadRequest(): string;

    public function index(Request $request): Response
    {
        $user = $request->user();

        $request->validate([
            'page' => ['nullable' => 'integer', 'min:1'],
        ]);

        $data = $this->service->{$this->relation()}($user);
        $resource = $this->resource();
        $relation = $this->relation();

        $uploadedId = $request->session()->get('uploaded_database_id');
        $uploadedRecord = $uploadedId ? new $resource($user->{$relation}->findOrFail($uploadedId)) : [];

        return Inertia::render($this->view(), [
            'data' => $resource::collection($data)->resolve($request),
            'pagination' => [
                'page' => $data->currentPage(),
                'hasMore' => $data->hasMorePages(),
            ],
            'uploadedRecord' => $uploadedRecord,
        ]);
    }

    public function upload(FormRequest $request): RedirectResponse
    {
        $formRequest = app($this->uploadRequest());
        
        $this->service->upload(
            file: $request->file('file'),
            title: $request->input('title'),
            ownerId: auth()->id()
        );

        return back();
    }
}
