<?php

namespace App\Services;

use App\Enums\ChatWithDocument\AnswerStatusEnum;
use App\Enums\ChatWithDocument\DocumentEmbeddingStatusEnum;
use App\Jobs\ChatWithDocument\ChatWithDocumentAsk;
use App\Jobs\ChatWithDocument\ChatWithDocumentEmbedding;
use App\Models\ChatWithDocument\Document;
use App\Models\ChatWithDocument\DocumentChatTurn;
use App\Models\User;
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
        $file = $this->storageService->upload(file: $file, path: "uploads/chat-with-document/$ownerId");

        $document = Document::create([
            'owner_id' => $ownerId,
            'title' => $title,
            'original_name' => $file['original_name'],
            'storage_path' => $file['storage_path'],
            'mime_type' => $file['mime_type'],
            'extension' => $file['extension'],
            'size' => $file['size'],
            'embedding_status' => DocumentEmbeddingStatusEnum::Pending,
            'last_message' => null,
        ]);

        ChatWithDocumentEmbedding::dispatch(document: $document)->afterCommit();

        return $document;
    }

    public function ask(Document $document, string $question): DocumentChatTurn
    {
        $documentChatTurn = $document->documentChatTurns()->create([
            'question' => $question,
            'answer_status' => AnswerStatusEnum::Pending,
        ]);

        ChatWithDocumentAsk::dispatch(documentChatTurn: $documentChatTurn)->afterCommit();

        return $documentChatTurn;
    }
}
