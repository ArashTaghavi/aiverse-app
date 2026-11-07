<?php

namespace App\Modules\DatabaseAnalyst\Services;

use App\Models\User;
use App\Modules\Base\Enums\ProcessingStatusEnum;
use App\Modules\Base\Enums\UploadProgressEnum;
use App\Modules\DatabaseAnalyst\Events\DatabaseEmbeddingRequested;
use App\Modules\DatabaseAnalyst\Events\DatabaseUploadProgress;
use App\Modules\DatabaseAnalyst\Models\Database;
use App\Services\StorageService;
use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\Paginator;

class DatabaseAnalystService
{
    public function __construct(private StorageService $storageService) {}

    public function databases(User $user): Paginator
    {
        return $user->databases()->latest('id')->simplePaginate(20, ['*'], 'documents_page');
    }

    public function upload(UploadedFile $file, string $title, int $ownerId): Database
    {
        $file = $this->storageService
            ->setBasePath(basePath: Database::uploadPath())
            ->upload(file: $file);

        $database = Database::create([
            'owner_id' => $ownerId,
            'title' => $title,
            'original_name' => $file['original_name'],
            'storage_path' => $file['storage_path'],
            'mime_type' => $file['mime_type'],
            'extension' => $file['extension'],
            'size' => $file['size'],
            'embedding_status' => ProcessingStatusEnum::Pending,
        ]);

        DatabaseUploadProgress::dispatch(
            model: $database,
            step: UploadProgressEnum::Upload->value,
            status: 'completed'
        );

        DatabaseEmbeddingRequested::dispatch(database: $database);

        return $database;

    }
}
