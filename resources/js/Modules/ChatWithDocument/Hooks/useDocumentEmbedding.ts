import { useState } from "react";
import { EmbeddableFileResponse } from "@/Modules/Base/Types/Responses/EmbeddableFileResponse";
import { ProcessingStatusEnum } from "@/Modules/Base/Enums/ProcessingStatusEnum";

export default function useDocumentEmbedding(
    document: EmbeddableFileResponse | null | undefined,
) {
    const [embeddingStatuses, setEmbeddingStatuses] = useState<
        Record<number, ProcessingStatusEnum>
    >({});
    const embeddingStatus = document
        ? document.embedding_status === "COMPLETED" ||
          document.embedding_status === "FAILED"
            ? document.embedding_status
            : (embeddingStatuses[document.id] ?? document.embedding_status)
        : undefined;

    function updateEmbeddingStatus(id: number, status: ProcessingStatusEnum) {
        setEmbeddingStatuses((current) => ({ ...current, [id]: status }));
    }

    return {
        embeddingStatus,
        isDocumentReady: embeddingStatus === "COMPLETED",
        updateEmbeddingStatus,
    };
}
