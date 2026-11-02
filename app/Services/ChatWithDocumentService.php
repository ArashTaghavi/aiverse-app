<?php

namespace App\Services;

use App\Enums\DocumentEmbeddingEnum;
use App\Jobs\ChatWithDocument\ChatWithDocumentEmbedding;
use App\Models\ChatWithDocument\Document;
use Illuminate\Http\UploadedFile;

class ChatWithDocumentService
{
    public function __construct(private StorageService $storageService) {}

    public function upload(UploadedFile $file, string $title, int $ownerId): Document
    {
        $file = $this->storageService->upload(file: $file, path: "uploads/chat-with-document/$ownerId");

        $document = Document::create([
            'owner_id' => $ownerId,
            'title' => $title,
            'original_name' => $file['original_name'],
            'storage_path' => $file['storage_path'],
            'mime_type' => $file['mime_type'],
            'extension' => $file['extension'],
            'size' => $file['size'],
            'embedding_status' => DocumentEmbeddingEnum::Pending,
            'last_message' => null,
        ]);

        ChatWithDocumentEmbedding::dispatch(
            document: $document
        )->afterCommit();

        return $document;
    }
}
