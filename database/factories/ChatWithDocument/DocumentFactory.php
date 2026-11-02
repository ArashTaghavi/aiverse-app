<?php

namespace Database\Factories\ChatWithDocument;

use App\Enums\ChatWithDocument\DocumentEmbeddingStatusEnum;
use App\Models\ChatWithDocument\Document;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Document>
 */
class DocumentFactory extends Factory
{
    protected $model = Document::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'owner_id' => User::factory(),
            'title' => fake()->sentence(3),
            'original_name' => 'notes.docx',
            'storage_path' => 'uploads/chat-with-document/notes.docx',
            'mime_type' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'extension' => 'docx',
            'size' => 1024,
            'embedding_status' => DocumentEmbeddingStatusEnum::Completed,
        ];
    }
}
