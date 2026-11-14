import type { RouteQueryOptions } from '@/wayfinder';
import type { ProcessingStatusEnum } from '../Enums/ProcessingStatusEnum';
import type { UploadProgressEnum } from '../Enums/UploadProgressEnum';
import type { ChatTurnResponse } from './Chat';
import type { EmbeddableFileResponse } from './Responses/EmbeddableFileResponse';

export type FileUploadValues = { title: string; file: File | null };
export type Pagination = { page: number; hasMore: boolean };
export type FileChatPageProps = {
    data: EmbeddableFileResponse[];
    uploadedRecord?: EmbeddableFileResponse | null;
    pagination: Pagination;
};
export type FileConversationPageProps = FileChatPageProps & {
    selectedData: EmbeddableFileResponse;
    history: ChatTurnResponse[];
};
export type FileChatConfig = {
    name: string;
    title: string;
    channelPrefix: string;
    eventId: 'document_id' | 'database_id';
    file: { label: string; extension: string; accept: string };
    events: Record<
        | 'UploadProgress'
        | 'EmbeddingCompleted'
        | 'EmbeddingFailed'
        | 'AnswerCompleted'
        | 'AnswerFailed',
        string
    >;
    routes: {
        index: (options?: RouteQueryOptions) => { url: string };
        upload: () => { url: string };
        show: (uuid: string, options?: RouteQueryOptions) => { url: string };
        status: (uuid: string) => { url: string };
        ask: (uuid: string) => { url: string };
    };
};
export type FileStatusEvent = {
    document_id?: number;
    database_id?: number;
    embedding_status?: ProcessingStatusEnum;
    answer_status?: ProcessingStatusEnum;
};
export type FileUploadProgressEvent = {
    step: UploadProgressEnum;
    status: Exclude<ProcessingStatusEnum, typeof ProcessingStatusEnum.Pending>;
    data: Pick<
        EmbeddableFileResponse,
        'id' | 'uuid' | 'title' | 'original_name' | 'embedding_status'
    > & {
        human_size: string;
        embedding_error: string | null;
    };
};
