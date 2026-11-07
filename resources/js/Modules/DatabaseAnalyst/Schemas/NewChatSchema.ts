import { z } from "zod";

export const NewChatSchema = z.object({
    title: z
        .string()
        .trim()
        .min(1, "Document name is required.")
        .refine(
            (name) => Array.from(name).length <= 100,
            "Document name must be 100 characters or fewer.",
        ),
    file: z
        .file()
        .nullable()
        .refine(
            (file): boolean => file !== null,
            "Choose a Word document (.sql).",
        )
        .refine(
            (file) => !file || /\.sql$/i.test(file.name),
            "Only Word documents (.sql) are allowed.",
        )
        .refine(
            (file) => !file || file.size > 0,
            "Choose a non-empty Word document (.sql).",
        )
        .refine(
            (file) => !file || file.size <= 4 * 1024 * 1024,
            "The document must be 4 MB or smaller.",
        ),
});
