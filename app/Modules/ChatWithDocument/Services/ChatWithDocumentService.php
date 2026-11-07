<?php

namespace App\Modules\ChatWithDocument\Services;

use App\Models\User;
use App\Modules\Base\Enums\ProcessingStatusEnum;
use App\Modules\Base\Enums\UploadProgressEnum;
use App\Modules\ChatWithDocument\DTOs\AskDTO;
use App\Modules\ChatWithDocument\Enums\RouteEnum;
use App\Modules\ChatWithDocument\Events\DocumentEmbeddingRequested;
use App\Modules\ChatWithDocument\Events\DocumentUploadProgress;
use App\Modules\ChatWithDocument\Models\Document;
use App\Modules\ChatWithDocument\Models\DocumentChatTurn;
use App\Services\AIClient;
use App\Services\StorageService;
use Generator;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Validation\ValidationException;
use Throwable;
use UnexpectedValueException;

class ChatWithDocumentService
{
    public function __construct(private StorageService $storageService, private AIClient $aiClient) {}

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
            'embedding_status' => ProcessingStatusEnum::Pending,
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
        if ($relatedDocument->embedding_status !== ProcessingStatusEnum::Completed) {
            throw ValidationException::withMessages([
                'question' => 'This document is not ready for questions yet.',
            ]);
        }

        $relatedDocument->update(['last_message' => $question]);
        $documentChatTurn = $relatedDocument->documentChatTurns()->create([
            'question' => $question,
            'answer_status' => ProcessingStatusEnum::Pending,
        ]);

        return $documentChatTurn;
    }

    /** @return Generator<int, string> */
    public function streamAnswer(DocumentChatTurn $documentChatTurn): Generator
    {
        $stream = null;
        $answer = '';
        $documentChatTurn->markAsProcessing();

        try {
            $data = new AskDTO(
                documentId: $documentChatTurn->document_id,
                ownerId: $documentChatTurn->document->owner_id,
                question: $documentChatTurn->question,
            );
            $stream = $this->aiClient->streamPost(RouteEnum::ASK->value, $data->toArray());

            while (! $stream->eof()) {
                $chunk = $stream->read(1024);

                if ($chunk === '') {
                    continue;
                }

                $answer .= $chunk;
                yield $chunk;
            }

            if (trim($answer) === '') {
                throw new UnexpectedValueException('The AI service returned an empty answer.');
            }

            $documentChatTurn->markAsCompleted(answer: $answer);
            $documentChatTurn->document->update(['last_message' => $answer]);
        } catch (Throwable $exception) {
            $documentChatTurn->markAsFailed(error: $exception->getMessage());

            throw $exception;
        } finally {
            $stream?->close();
        }
    }
}
