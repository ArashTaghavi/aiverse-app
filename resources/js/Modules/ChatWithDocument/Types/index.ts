import type { z } from "zod";
import type { NewChatSchema } from "@/Modules/ChatWithDocument/Schemas/NewChatSchema";
import type { ChatTurnResponse } from "@/Modules/Base/Types/Chat";
import { ProcessingStatusEnum } from "@/Modules/Base/Enums/ProcessingStatusEnum";
import { EmbeddableFileResponse } from "@/Modules/Base/Types/Responses/EmbeddableFileResponse";
export type { ChatTurnResponse } from "@/Modules/Base/Types/Chat";

export type ChatWithDatabaseChatProps = {
    documents: EmbeddableFileResponse[];
    uploadedDocument?: EmbeddableFileResponse | null;
    pagination: { page: number; hasMore: boolean };
};

export type NewChatFormValues = z.infer<typeof NewChatSchema>;
export type DocumentConversationPageProps = ChatWithDatabaseChatProps & {
    selectedDocument: EmbeddableFileResponse;
    history: ChatTurnResponse[];
    historyPagination: { page: number; hasMore: boolean };
};
export type DocumentNotificationsProps = { userId: number };

export type EmbeddingCompletedPayload = {
    document_id: number;
    embedding_status: "COMPLETED";
};

export type DocumentEmbeddingListenerProps = {
    userId: number;
    onUpdate: (documentId: number, status: ProcessingStatusEnum) => void;
};
