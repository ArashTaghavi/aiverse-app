<?php

use App\Modules\Base\Enums\ProcessingStatusEnum;
use App\Modules\ChatWithDocument\Models\Document;
use App\Modules\ChatWithDocument\Models\DocumentChatTurn;
use App\Modules\DatabaseAnalyst\Models\Database;
use App\Modules\DatabaseAnalyst\Models\DatabaseChatTurn;
use Illuminate\Database\Eloquent\Model;

test('processing statuses preserve stored and serialized values across models', function (string $modelClass, string $attribute, ProcessingStatusEnum $status, string $storedValue) {
    /** @var Model $model */
    $model = new $modelClass;
    $model->setRawAttributes([$attribute => $storedValue]);

    expect($model->getAttribute($attribute))->toBe($status);

    $model->setAttribute($attribute, $status);

    expect($model->getAttributes()[$attribute])->toBe($storedValue);
    expect($model->attributesToArray()[$attribute])->toBe($storedValue);
})->with([
    'document embedding' => [Document::class, 'embedding_status'],
    'database embedding' => [Database::class, 'embedding_status'],
    'document answer' => [DocumentChatTurn::class, 'answer_status'],
    'database answer' => [DatabaseChatTurn::class, 'answer_status'],
])->with([
    'pending' => [ProcessingStatusEnum::Pending, 'PENDING'],
    'processing' => [ProcessingStatusEnum::Processing, 'PROCESSING'],
    'completed' => [ProcessingStatusEnum::Completed, 'COMPLETED'],
    'failed' => [ProcessingStatusEnum::Failed, 'FAILED'],
]);
