import { useState } from "react";
import type { DocumentResponse, EmbeddingStatus } from "@/types";

export default function useDocumentEmbedding(document: DocumentResponse | null | undefined) {
    const [embeddingStatuses, setEmbeddingStatuses] = useState<Record<number, EmbeddingStatus>>({});
    const embeddingStatus = document
        ? (embeddingStatuses[document.id] ?? document.embedding_status)
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
