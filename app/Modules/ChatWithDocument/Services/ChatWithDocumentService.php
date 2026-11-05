<?php

namespace App\Modules\ChatWithDocument\Services;

use App\Models\User;
use App\Modules\Base\Enums\AnswerStatusEnum;
use App\Modules\Base\Enums\EmbeddingStatusEnum;
use App\Modules\Base\Enums\UploadProgressEnum;
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
            ->setBasePath(basePath: Document::uploadPath()."/$ownerId")
            ->upload(file: $file);

        $document = Document::create([
            'owner_id' => $ownerId,
            'title' => $title,
            'original_name' => $file['original_name'],
            'storage_path' => $file['storage_path'],
            'mime_type' => $file['mime_type'],
            'extension' => $file['extension'],
            'size' => $file['size'],
            'embedding_status' => EmbeddingStatusEnum::Pending,
        ]);

        DocumentUploadProgress::dispatch(
            model: $document,
            step: UploadProgressEnum::Upload->value,
            status: 'completed'
        );

        DocumentEmbeddingRequested::dispatch(document: $document);

        return $document;
    }

    public function ask(Document $relatedDocument, string $question): DocumentChatTurn
    {
        $relatedDocument->update(['last_message' => $question]);
        $documentChatTurn = $relatedDocument->documentChatTurns()->create([
            'question' => $question,
            'answer_status' => AnswerStatusEnum::Pending,
        ]);

        Ask::dispatch(documentChatTurn: $documentChatTurn);

        return $documentChatTurn;
    }
}
