<?php

namespace Database\Factories;

use App\Models\User;
use App\Modules\Base\Enums\ProcessingStatusEnum;
use App\Modules\ChatWithDocument\Models\Document;
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
            'original_name' => 'document.docx',
            'storage_path' => 'documents/document.docx',
            'mime_type' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'extension' => 'docx',
            'size' => 1024,
            'embedding_status' => ProcessingStatusEnum::Completed,
        ];
    }
}
