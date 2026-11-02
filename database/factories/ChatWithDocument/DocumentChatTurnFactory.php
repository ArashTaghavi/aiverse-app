<?php

namespace Database\Factories\ChatWithDocument;

use App\Enums\ChatWithDocument\AnswerStatusEnum;
use App\Models\ChatWithDocument\DocumentChatTurn;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<DocumentChatTurn>
 */
class DocumentChatTurnFactory extends Factory
{
    protected $model = DocumentChatTurn::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'document_id' => DocumentFactory::new(),
            'question' => fake()->sentence(),
            'answer' => fake()->paragraph(),
            'answer_status' => AnswerStatusEnum::Completed,
        ];
    }
}
