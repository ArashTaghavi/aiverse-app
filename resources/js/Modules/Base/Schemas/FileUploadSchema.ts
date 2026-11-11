import { z } from "zod";

export function createFileUploadSchema(extension: string) {
    return z.object({
        title: z
            .string()
            .trim()
            .min(1, "Conversation name is required.")
            .refine((title) => Array.from(title).length <= 100, "Use 100 characters or fewer."),
        file: z
            .file()
            .nullable()
            .refine((file) => file !== null, `Choose a ${extension} file.`)
            .refine(
                (file) => !file || file.name.toLowerCase().endsWith(extension),
                `Only ${extension} files are allowed.`,
            )
            .refine((file) => !file || file.size > 0, "Choose a non-empty file.")
            .refine(
                (file) => !file || file.size <= 4 * 1024 * 1024,
                "The file must be 4 MB or smaller.",
            ),
    });
}
