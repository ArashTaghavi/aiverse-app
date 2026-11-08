import { useState } from 'react';
import { EmbeddableFileResponse } from '@/Modules/Base/Types/Responses/EmbeddableFileResponse';
import { ProcessingStatusEnum } from '@/Modules/Base/Enums/ProcessingStatusEnum';

export default function useFileEmbedding(file: EmbeddableFileResponse) {
    const [embeddingStatus, setEmbeddingStatus] = useState(
        file.embedding_status,
    );

    function updateEmbeddingStatus(id: number, status: ProcessingStatusEnum) {
        if (id === file.id) setEmbeddingStatus(status);
    }

    return {
        embeddingStatus,
        isFileReady: embeddingStatus === ProcessingStatusEnum.Completed,
        updateEmbeddingStatus,
    };
}
