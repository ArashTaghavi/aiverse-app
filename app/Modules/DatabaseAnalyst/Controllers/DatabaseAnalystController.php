<?php

namespace App\Modules\DatabaseAnalyst\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Base\Requests\UploadRequest;
use App\Modules\DatabaseAnalyst\Services\DatabaseAnalystService;
use Illuminate\Http\RedirectResponse;

class DatabaseAnalystController extends Controller
{
    public function __construct(private DatabaseAnalystService $service) {}

    public function upload(UploadRequest $request): RedirectResponse
    {
        $this->service->upload(
            file: $request->file('file'),
            title: $request->input('title'),
            ownerId: auth()->id()
        );

        return back();
    }
}
