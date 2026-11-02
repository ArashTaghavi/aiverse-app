<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\ChatWithDocument\ChatWithDocumentUploadRequest;
use App\Http\Resources\ChatWithDocument\ChatWithDocumentMinifyResource;
use App\Services\ChatWithDocumentService;

class ChatWithDocumentController extends Controller
{
    public function __construct(private ChatWithDocumentService $service) {}

    public function upload(ChatWithDocumentUploadRequest $request): ChatWithDocumentMinifyResource
    {
        $result = $this->service->upload(
            file: $request->file('file'),
            title: $request->input('title'),
            ownerId: auth()->id()
        );

        return new ChatWithDocumentMinifyResource($result);
    }
}
