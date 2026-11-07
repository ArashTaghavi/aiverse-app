import type { z } from "zod";
import type { ChatTurnResponse } from "@/Modules/Base/Types/Chat";
import { ProcessingStatusEnum } from "@/Modules/Base/Enums/ProcessingStatusEnum";
import { EmbeddableFileResponse } from "@/Modules/Base/Types/Responses/EmbeddableFileResponse";
import { NewChatSchema } from "@/Modules/ChatWithDocument/Schemas/NewChatSchema";
export type { ChatTurnResponse } from "@/Modules/Base/Types/Chat";

export type DatabaseAnalystProps = {
    databases: EmbeddableFileResponse[];
    uploadedDatabase?: EmbeddableFileResponse | null;
    databasesPagination: { page: number; hasMore: boolean };
};

export type NewChatFormValues = z.infer<typeof NewChatSchema>;
export type DatabaseConversationPageProps = DatabaseAnalystProps & {
    selectedDatabase: EmbeddableFileResponse;
    history: ChatTurnResponse[];
    historyPagination: { page: number; hasMore: boolean };
};
export type DatabaseNotificationsProps = { userId: number };

export type EmbeddingCompletedPayload = {
    document_id: number;
    embedding_status: "COMPLETED";
};

export type DatabaseEmbeddingListenerProps = {
    userId: number;
    onUpdate: (documentId: number, status: ProcessingStatusEnum) => void;
};
