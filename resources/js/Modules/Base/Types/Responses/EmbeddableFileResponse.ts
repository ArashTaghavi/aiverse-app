import { ProcessingStatusEnum } from '@/Modules/Base/Enums/ProcessingStatusEnum';

export type EmbeddableFileResponse = {
    id: number;
    uuid: string;
    title: string;
    original_name: string;
    size: string;
    last_message: string | null;
    embedding_status: ProcessingStatusEnum;
    created_at: string;
};
