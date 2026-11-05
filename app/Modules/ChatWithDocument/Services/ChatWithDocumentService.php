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
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Validation\ValidationException;
use Throwable;

class ChatWithDocumentService
{
    public function __construct(private StorageService $storageService) {}

    /** @return Paginator<int, Document> */
    public function documents(User $user): Paginator
    {
        return $user->documents()->latest('id')->simplePaginate(20, ['*'], 'documents_page');
    }

    public function upload(UploadedFile $file, string $title, int $ownerId): Document
    {
        $file = $this->storageService
            ->setDisk('local')
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

        try {
            DocumentUploadProgress::dispatch(
                model: $document,
                step: UploadProgressEnum::Upload->value,
                status: 'completed'
            );
        } catch (Throwable $exception) {
            report($exception);
        }

        DocumentEmbeddingRequested::dispatch(document: $document);

        return $document;
    }

    public function ask(Document $relatedDocument, string $question): DocumentChatTurn
    {
        if ($relatedDocument->embedding_status !== EmbeddingStatusEnum::Completed) {
            throw ValidationException::withMessages([
                'question' => 'This document is not ready for questions yet.',
            ]);
        }

        $relatedDocument->update(['last_message' => $question]);
        $documentChatTurn = $relatedDocument->documentChatTurns()->create([
            'question' => $question,
            'answer_status' => AnswerStatusEnum::Pending,
        ]);

        Ask::dispatch(documentChatTurn: $documentChatTurn);

        return $documentChatTurn;
    }
}
