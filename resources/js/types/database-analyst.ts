import type { RouteDefinition } from '@/wayfinder';

export type DatabaseAnswer = {
    initial_sql: string;
    sql: string;
    text: string;
    result: string;
    success: boolean;
    refined: boolean;
    feedback: string;
};
export type DatabaseProgress = { stage: string; message: string };
export type AnalysisProgressProps = {
    steps: DatabaseProgress[];
    finished: boolean;
    failed: boolean;
};
export type AnalysisEvent =
    | { request_id: string; type: 'progress'; data: DatabaseProgress }
    | { request_id: string; type: 'result'; data: DatabaseAnswer }
    | { request_id: string; type: 'error'; data: { message: string } };

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
