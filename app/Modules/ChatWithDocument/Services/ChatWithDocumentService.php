<?php

namespace App\Modules\ChatWithDocument\Services;

use App\Models\User;
use App\Modules\ChatWithDocument\Enums\AnswerStatusEnum;
use App\Modules\ChatWithDocument\Enums\DocumentEmbeddingStatusEnum;
use App\Modules\ChatWithDocument\Enums\DocumentUploadProgressEnum;
use App\Modules\ChatWithDocument\Events\DocumentEmbeddingRequested;
use App\Modules\ChatWithDocument\Events\DocumentUploadProgress;
use App\Modules\ChatWithDocument\Jobs\Ask;
use App\Modules\ChatWithDocument\Models\Document;
use App\Modules\ChatWithDocument\Models\DocumentChatTurn;
use App\Services\StorageService;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;

class ChatWithDocumentService
{
    public function __construct(private StorageService $storageService) {}

    public function documents(User $user): Collection
    {
        return $user->documents()->latest('id')->get();
    }

    public function upload(UploadedFile $file, string $title, int $ownerId): Document
    {
        $file = $this->storageService
            ->setBasePath(basePath: Document::UPLOAD_PATH."/$ownerId")
            ->upload(file: $file);

        $document = Document::create([
            'owner_id' => $ownerId,
            'title' => $title,
            'original_name' => $file['original_name'],
            'storage_path' => $file['storage_path'],
            'mime_type' => $file['mime_type'],
            'extension' => $file['extension'],
            'size' => $file['size'],
            'embedding_status' => DocumentEmbeddingStatusEnum::Pending,
        ]);

        DocumentUploadProgress::dispatch(
            document: $document,
            step: DocumentUploadProgressEnum::Upload->value,
            status: 'completed'
        );

        DocumentEmbeddingRequested::dispatch(document: $document);

        return $document;
    }

    public function ask(Document $relatedDocument, string $question): DocumentChatTurn
    {
        $documentChatTurn = $relatedDocument->documentChatTurns()->create([
            'question' => $question,
            'answer_status' => AnswerStatusEnum::Pending,
        ]);

        Ask::dispatch(documentChatTurn: $documentChatTurn);

        return $documentChatTurn;
    }
}
