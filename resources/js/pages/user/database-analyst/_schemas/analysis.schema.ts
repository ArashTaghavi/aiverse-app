import { z } from 'zod';

export const answerSchema = z.object({
    initial_sql: z.string(),
    sql: z.string(),
    text: z.string(),
    result: z.string(),
    success: z.boolean(),
    refined: z.boolean(),
    feedback: z.string(),
});

export const progressSchema = z.object({
    stage: z.string(),
    message: z.string(),
});

export const analysisEventSchema = z.discriminatedUnion('type', [
    z.object({
        request_id: z.string(),
        type: z.literal('progress'),
        data: progressSchema,
    }),
    z.object({
        request_id: z.string(),
        type: z.literal('result'),
        data: answerSchema,
    }),
    z.object({
        request_id: z.string(),
        type: z.literal('error'),
        data: z.object({ message: z.string() }),
    }),
]);
