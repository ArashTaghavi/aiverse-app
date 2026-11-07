import { useState } from "react";
import type { DocumentResponse, EmbeddingStatus } from '@/Modules/ChatWithDocument/Types';

export default function useDocumentEmbedding(
    document: DocumentResponse | null | undefined,
) {
    const [embeddingStatuses, setEmbeddingStatuses] = useState<
        Record<number, EmbeddingStatus>
    >({});
    const embeddingStatus = document
        ? document.embedding_status === "COMPLETED" ||
          document.embedding_status === "FAILED"
            ? document.embedding_status
            : (embeddingStatuses[document.id] ?? document.embedding_status)
        : undefined;

    function updateEmbeddingStatus(id: number, status: EmbeddingStatus) {
        setEmbeddingStatuses((current) => ({ ...current, [id]: status }));
    }

    return {
        embeddingStatus,
        isDocumentReady: embeddingStatus === "COMPLETED",
        updateEmbeddingStatus,
    };
}
