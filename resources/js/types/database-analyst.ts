import type { z } from 'zod';
import type {
    analysisEventSchema,
    answerSchema,
    progressSchema,
} from '@/pages/user/database-analyst/_schemas/analysis.schema';
import type { RouteDefinition } from '@/wayfinder';

export type DatabaseAnswer = z.infer<typeof answerSchema>;
export type DatabaseProgress = z.infer<typeof progressSchema>;
export type AnalysisProgressProps = {
    steps: DatabaseProgress[];
    finished: boolean;
    failed: boolean;
};
export type AnalysisEvent = z.infer<typeof analysisEventSchema>;

export type DatabaseTurn = {
    id: string;
    question: string;
    answer?: DatabaseAnswer;
    createdAt: string;
    error?: string;
    steps: DatabaseProgress[];
};

export type DatabaseConversation = {
    id: string;
    title: string;
    turns: DatabaseTurn[];
};

export type DatabaseAnalysisRequest = {
    requestId: string;
    chatId: string;
    turnId: string;
};
export type DatabaseChatProps = {
    initialConversations?: DatabaseConversation[];
    askAction?: () => RouteDefinition<'post'>;
};
export type AnalysisListenerProps = {
    userId: number;
    onUpdate: (event: AnalysisEvent) => void;
};
