import { Module } from '../Module';

export const EventEnum = {
    UploadProgress: `${Module.Name}.upload.progress`,
    EmbeddingCompleted: `${Module.Name}.embedding.completed`,
    EmbeddingFailed: `${Module.Name}.embedding.failed`,
    AnswerCompleted: `${Module.Name}.answer.completed`,
    AnswerFailed: `${Module.Name}.answer.failed`,
} as const;

export type EventEnum = (typeof EventEnum)[keyof typeof EventEnum];
