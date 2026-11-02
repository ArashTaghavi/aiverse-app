import type { z } from 'zod';
import type { newChatSchema } from '@/pages/user/chat-with-document/_schemas/new-chat.schema';
import type { documentQuestionSchema } from '@/pages/user/chat-with-document/_schemas/question.schema';

export type EmbeddingStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export type DocumentResponse = {
    id: number;
    title: string;
    original_name: string;
    size: string;
    created_at: string;
    last_message: string | null;
    embedding_status: EmbeddingStatus;
};

export type ChatTurnResponse = {
    id: number;
    question: string;
    answer: string | null;
    answer_status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    created_at: string;
};

export type DocumentChatProps = {
    documentId?: string | null;
    documents?: DocumentResponse[];
    selectedDocument?: DocumentResponse | null;
    history?: ChatTurnResponse[];
};

export type NewChatFormValues = z.infer<typeof newChatSchema>;
export type DocumentQuestionValues = z.infer<typeof documentQuestionSchema>;
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
