import type { ProcessingStatusEnum } from '@/Modules/Base/Enums/ProcessingStatusEnum';

export type ChatTurnResponse = {
    id: number;
    question: string;
    answer: string | null;
    answer_status: ProcessingStatusEnum;
    created_at: string;
};

export type MessageHistoryProps = { turns: ChatTurnResponse[] };
export type MessageTimeProps = { timestamp: string };
