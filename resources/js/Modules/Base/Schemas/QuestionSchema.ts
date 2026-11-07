import { z } from "zod";

export const QuestionSchema = z.object({
    question: z
        .string()
        .trim()
        .min(1, "Enter a question.")
        .refine(
            (question) => Array.from(question).length <= 500,
            "Your question must be 500 characters or fewer.",
        ),
});

export type QuestionValues = z.infer<typeof QuestionSchema>;
