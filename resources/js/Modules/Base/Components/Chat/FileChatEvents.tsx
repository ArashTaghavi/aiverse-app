import { useConnectionStatus, useEcho } from '@laravel/echo-react';
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
    onAnswerUpdate: () => Promise<void>;
    onEmbeddingUpdate: (id: number, status: ProcessingStatusEnum) => void;
};

export default function FileChatEvents({
    config,
    userId,
    fileId,
    onAnswerUpdate,
    onEmbeddingUpdate,
}: Props) {
    const onUpdate = useRef(onEmbeddingUpdate);
    useEffect(() => {
        onUpdate.current = onEmbeddingUpdate;
    }, [onEmbeddingUpdate]);
    const channel = `${config.channelPrefix}.${userId}`;
    const connectionStatus = useConnectionStatus();
    useEffect(() => {
        if (connectionStatus === 'connected') void onAnswerUpdate();
    }, [connectionStatus, onAnswerUpdate]);
    useEffect(() => {
        const refresh = () => {
            if (document.visibilityState === 'visible') void onAnswerUpdate();
        };
        window.addEventListener('online', refresh);
        document.addEventListener('visibilitychange', refresh);
        return () => {
            window.removeEventListener('online', refresh);
            document.removeEventListener('visibilitychange', refresh);
        };
    }, [onAnswerUpdate]);

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
            if (Number(event[config.eventId]) !== fileId) return;
            void onAnswerUpdate();
        },
        [config, fileId, onAnswerUpdate],
    );
    return null;
}
