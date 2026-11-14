import { FileChatConfig } from '@/Modules/Base/Types/FileChat';
import { ProcessingStatusEnum } from '@/Modules/Base/Enums/ProcessingStatusEnum';
import { useCallback, useEffect, useRef, useState } from 'react';
import { router } from '@inertiajs/react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ChatTurnResponse } from '@/Modules/Base/Types/Chat';
import { QuestionSchema } from '@/Modules/Base/Schemas/QuestionSchema';
import { QuestionValues } from '@/Types/UserPanel';
import {
    createHistoryRefresh,
    isHistoryTurnSettled,
} from '@/Modules/Base/Utils/HistoryRefresh';

export default function useFileQuestion(
    config: FileChatConfig,
    fileUuid: string,
    isFileReady: boolean,
    history: ChatTurnResponse[],
) {
    const [asking, setAsking] = useState(false);
    const activeRequest = useRef<AbortController | null>(null);
    const streaming = useRef(false);
    const refreshQueue = useRef<ReturnType<typeof createHistoryRefresh> | null>(
        null,
    );
    const [pendingTurn, setPendingTurn] = useState<ChatTurnResponse | null>(
        null,
    );
    const questionForm = useForm<QuestionValues>({
        resolver: zodResolver(QuestionSchema),
        defaultValues: { question: '' },
    });

    useEffect(() => {
        let cancelReload: (() => void) | undefined;
        const queue = createHistoryRefresh(
            () =>
                new Promise<void>((resolve) => {
                    router.reload({
                        only: ['history', 'data'],
                        async: true,
                        onCancelToken: (token) => {
                            cancelReload = () => token.cancel();
                        },
                        onFinish: () => {
                            cancelReload = undefined;
                            resolve();
                        },
                    });
                }),
            () => streaming.current,
        );
        refreshQueue.current = queue;
        return () => {
            activeRequest.current?.abort();
            queue.dispose();
            cancelReload?.();
            refreshQueue.current = null;
        };
    }, [fileUuid]);

    const refreshHistory = useCallback(async () => {
        try {
            await refreshQueue.current?.request();
        } catch {
            questionForm.setError('root.server', {
                type: 'server',
                message: 'Could not synchronize messages. Please try again.',
            });
        }
    }, [questionForm]);

    useEffect(() => {
        if (!pendingTurn) return;
        const saved = history.find((turn) => turn.id === pendingTurn.id);
        const failed = saved?.answer_status === ProcessingStatusEnum.Failed;
        if (!saved || !isHistoryTurnSettled(saved)) return;
        setPendingTurn((turn) => (turn?.id === saved.id ? null : turn));
        if (failed) {
            questionForm.setError('root.server', {
                type: 'server',
                message: 'The answer was interrupted. Please try again.',
            });
        }
    }, [history, pendingTurn, questionForm]);

    const sendQuestion: SubmitHandler<QuestionValues> = async (data) => {
        if (!isFileReady || activeRequest.current) return;

        const controller = new AbortController();
        activeRequest.current = controller;
        streaming.current = true;
        let turnId: number | null = null;
        setAsking(true);
        questionForm.clearErrors();
        setPendingTurn({
            id: -Date.now(),
            question: data.question,
            answer: null,
            answer_status: ProcessingStatusEnum.Pending,
            created_at: new Date().toISOString(),
        });

        try {
            const csrfCookie = document.cookie
                .split('; ')
                .find((cookie) => cookie.startsWith('XSRF-TOKEN='));
            if (!csrfCookie) {
                throw new Error(
                    'Your session has expired. Refresh the page and try again.',
                );
            }

            const response = await fetch(config.routes.ask(fileUuid).url, {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-XSRF-TOKEN': decodeURIComponent(
                        csrfCookie.slice('XSRF-TOKEN='.length),
                    ),
                },
                body: JSON.stringify(data),
                signal: controller.signal,
            });

            if (!response.ok) {
                const error = (await response.json().catch(() => null)) as {
                    message?: string;
                    errors?: { question?: string[] };
                } | null;
                if (error?.errors?.question?.[0]) {
                    questionForm.setError('question', {
                        type: 'server',
                        message: error.errors.question[0],
                    });
                }

                throw new Error(
                    error?.message ??
                        'Could not send your question. Please try again.',
                );
            }

            if (
                !response.body ||
                !response.headers.get('Content-Type')?.startsWith('text/plain')
            ) {
                throw new Error('The server did not return an answer stream.');
            }

            const responseTurnId = Number(
                response.headers.get('X-Chat-Turn-Id'),
            );
            turnId = responseTurnId > 0 ? responseTurnId : null;
            setPendingTurn((turn) =>
                turn
                    ? {
                          ...turn,
                          id: turnId ?? turn.id,
                          answer_status: ProcessingStatusEnum.Processing,
                      }
                    : null,
            );
            questionForm.reset();

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let answer = '';
            try {
                while (true) {
                    const { value, done } = await reader.read();
                    answer += done
                        ? decoder.decode()
                        : decoder.decode(value, { stream: true });
                    const text = answer;
                    setPendingTurn((turn) =>
                        turn ? { ...turn, answer: text || null } : null,
                    );
                    if (done) break;
                }
            } finally {
                reader.releaseLock();
            }

            if (!answer.trim())
                throw new Error('No answer was returned. Please try again.');
            setPendingTurn((turn) =>
                turn
                    ? { ...turn, answer_status: ProcessingStatusEnum.Completed }
                    : null,
            );
        } catch (error) {
            if (controller.signal.aborted) return;
            questionForm.setError('root.server', {
                type: 'server',
                message:
                    error instanceof Error
                        ? error.message
                        : 'The connection was interrupted. Please try again.',
            });
            setPendingTurn((turn) =>
                turnId && turn
                    ? {
                          ...turn,
                          answer_status: ProcessingStatusEnum.Failed,
                      }
                    : null,
            );
        } finally {
            streaming.current = false;
            if (!controller.signal.aborted) {
                await refreshHistory();
            }
            if (!controller.signal.aborted) {
                activeRequest.current = null;
                setAsking(false);
            }
        }
    };

    return {
        questionForm,
        asking,
        sendQuestion,
        pendingTurn,
        refreshHistory,
    };
}
