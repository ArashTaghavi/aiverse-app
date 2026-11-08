import { router } from '@inertiajs/react';
import { useEcho } from '@laravel/echo-react';
import { useEffect, useRef } from 'react';
import type { ProcessingStatusEnum } from '../../Enums/ProcessingStatusEnum';
import type {
    FileChatConfig,
    FileStatusEvent,
    FileUploadProgressEvent,
} from '../../Types/FileChat';

type Props = {
    config: FileChatConfig;
    userId: number;
    fileId: number;
    asking: boolean;
    onEmbeddingUpdate: (id: number, status: ProcessingStatusEnum) => void;
};

export default function FileChatEvents({
    config,
    userId,
    fileId,
    asking,
    onEmbeddingUpdate,
}: Props) {
    const onUpdate = useRef(onEmbeddingUpdate);
    useEffect(() => {
        onUpdate.current = onEmbeddingUpdate;
    }, [onEmbeddingUpdate]);
    const channel = `${config.channelPrefix}.${userId}`;

    useEcho<FileStatusEvent>(
        channel,
        [
            `.${config.events.EmbeddingCompleted}`,
            `.${config.events.EmbeddingFailed}`,
        ],
        (event) => {
            const id = event[config.eventId];
            if (id === fileId && event.embedding_status)
                onUpdate.current(id, event.embedding_status);
        },
        [config, fileId],
    );
    useEcho<FileUploadProgressEvent>(
        channel,
        `.${config.events.UploadProgress}`,
        (event) => {
            if (event.data.id === fileId)
                onUpdate.current(fileId, event.data.embedding_status);
        },
        [fileId],
    );
    useEcho<FileStatusEvent>(
        channel,
        [`.${config.events.AnswerCompleted}`, `.${config.events.AnswerFailed}`],
        (event) => {
            if (event[config.eventId] !== fileId || asking) return;
            router.reload({
                only: ['history', 'data', 'historyPagination'],
                data: { history_page: 1 },
            });
        },
        [config, fileId, asking],
    );
    return null;
}
