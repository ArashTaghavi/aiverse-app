import { router } from "@inertiajs/react";
import { useEcho } from "@laravel/echo-react";

type Props = {
    userId: number;
    documentId: number | null;
};

export default function DocumentAnswerListener({ userId, documentId }: Props) {
    useEcho<{
        document_id: number;
        answer_status: string;
    }>(
        `chat-with-document.users.${userId}`,
        [".chat-with-document.answer.completed", ".chat-with-document.answer.failed"],
        (event) => {
            if (event.document_id !== documentId) return;

            router.reload({
                only: ["history", "documents"],
            });
        },
        [documentId],
    );

    return null;
}
