import { router } from "@inertiajs/react";
import { useEcho } from "@laravel/echo-react";
import type { ProcessingStatusEnum } from "@/Modules/Base/Enums/ProcessingStatusEnum";

type Props = {
    userId: number;
    documentId: number;
};

export default function DocumentAnswerListener({ userId, documentId }: Props) {
    useEcho<{
        document_id: number;
        answer_status: ProcessingStatusEnum;
    }>(
        `chat-with-document.users.${userId}`,
        [
            ".chat-with-document.answer.completed",
            ".chat-with-document.answer.failed",
        ],
        (event) => {
            if (event.document_id !== documentId) return;

            router.reload({
                only: ["history", "data"],
            });
        },
        [documentId],
    );

    return null;
}
