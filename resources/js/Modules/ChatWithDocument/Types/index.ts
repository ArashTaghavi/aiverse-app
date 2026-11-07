import type { z } from 'zod';
import type { newChatSchema } from '@/Modules/ChatWithDocument/Schemas/NewChatSchema';
import type { questionSchema } from '@/Modules/Base/Schemas/QuestionSchema';
import type { ChatTurnResponse } from '@/Modules/Base/Types/Chat';
export type { ChatTurnResponse } from '@/Modules/Base/Types/Chat';

export type EmbeddingStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export type DocumentResponse = {
    id: number;
    uuid: string;
    title: string;
    original_name: string;
    size: string;
    last_message: string | null;
    embedding_status: EmbeddingStatus;
    created_at: string;
};

export type DocumentChatProps = {
    documents: DocumentResponse[];
    uploadedDocument?: DocumentResponse | null;
    documentsPagination: { page: number; hasMore: boolean };
};

export type NewChatFormValues = z.infer<typeof newChatSchema>;
export type DocumentQuestionValues = z.infer<typeof questionSchema>;
export type DocumentConversationPageProps = DocumentChatProps & {
    selectedDocument: DocumentResponse;
    history: ChatTurnResponse[];
    historyPagination: { page: number; hasMore: boolean };
};
export type DocumentNotificationsProps = { userId: number };

export type EmbeddingCompletedPayload = {
    document_id: number;
    embedding_status: 'COMPLETED';
};

export type DocumentEmbeddingListenerProps = {
    userId: number;
    onUpdate: (documentId: number, status: EmbeddingStatus) => void;
};
