import type { z } from 'zod';
import type { newChatSchema } from '@/pages/user/chat-with-document/_schemas/new-chat.schema';
import type { RouteDefinition } from '@/wayfinder';

export type EmbeddingStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export type DocumentResponse = {
    id: number;
    name: string;
    original_file_name: string;
    created_at: string;
    last_message_preview: string | null;
    last_message_at: string | null;
    embedding_status: EmbeddingStatus;
};

export type ChatTurnResponse = {
    id: number;
    question: string;
    answer: string;
    created_at: string;
};

export type DocumentChatProps = {
    documentId?: string | null;
    documents?: DocumentResponse[];
    selectedDocument?: DocumentResponse | null;
    history?: ChatTurnResponse[];
    askAction?: (documentId: number) => RouteDefinition<'post'>;
};

export type NewChatFormValues = z.infer<typeof newChatSchema>;
export type DocumentConversationPageProps = DocumentChatProps & {
    documentId: string;
};
export type MessageHistoryProps = { turns: ChatTurnResponse[] };
export type MessageTimeProps = { timestamp: string };
export type DocumentNotificationsProps = { userId: number };

export type EmbeddingCompletedPayload = {
    document_id: number;
    embedding_status: 'COMPLETED';
};

export type DocumentEmbeddingListenerProps = {
    userId: number;
    onUpdate: (documentId: number, status: EmbeddingStatus) => void;
};
