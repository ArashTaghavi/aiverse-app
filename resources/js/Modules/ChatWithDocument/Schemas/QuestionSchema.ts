import { z } from 'zod';

export const documentQuestionSchema = z.object({
    question: z
        .string()
        .trim()
        .min(1, 'Enter a question.')
        .refine(
            (question) => Array.from(question).length <= 500,
            'Your question must be 500 characters or fewer.',
        ),
});
