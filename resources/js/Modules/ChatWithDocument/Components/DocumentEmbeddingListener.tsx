import { useEcho } from "@laravel/echo-react";
import { useEffect, useRef } from "react";
import type { DocumentEmbeddingListenerProps } from "@/Modules/ChatWithDocument/Types";
import { ProcessingStatusEnum } from "@/Modules/Base/Enums/ProcessingStatusEnum";

export default function DocumentEmbeddingListener({
    userId,
    onUpdate,
}: DocumentEmbeddingListenerProps) {
    const handler = useRef(onUpdate);
    useEffect(() => {
        handler.current = onUpdate;
    }, [onUpdate]);

    useEcho<{ document_id: number; embedding_status: ProcessingStatusEnum }>(
        `chat-with-document.users.${userId}`,
        [
            ".chat-with-document.embedding.completed",
            ".chat-with-document.embedding.failed",
        ],
        (event) => handler.current(event.document_id, event.embedding_status),
    );

    return null;
}
