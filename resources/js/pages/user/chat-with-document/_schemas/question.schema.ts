import { z } from 'zod';

export const documentQuestionSchema = z.object({
    question: z.string().trim().min(1, 'Enter a question.'),
});
