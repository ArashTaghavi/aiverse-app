import { ProcessingStatusEnum } from "@/Modules/Base/Enums/ProcessingStatusEnum";
import { useEffect, useRef, useState } from "react";
import { router } from "@inertiajs/react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ask } from "@/actions/App/Modules/ChatWithDocument/Controllers/ChatWithDocumentController";
import type { ChatTurnResponse } from "@/Modules/ChatWithDocument/Types";
import { QuestionSchema } from "@/Modules/Base/Schemas/QuestionSchema";
import { QuestionValues } from "@/Types/UserPanel";

export default function useDocumentQuestion(
    documentUuid: string,
    isDocumentReady: boolean,
) {
    const [asking, setAsking] = useState(false);
    const activeRequest = useRef<AbortController | null>(null);
    const [pendingTurn, setPendingTurn] = useState<ChatTurnResponse | null>(
        null,
    );
    const questionForm = useForm<QuestionValues>({
        resolver: zodResolver(QuestionSchema),
        defaultValues: { question: "" },
    });

    useEffect(() => () => activeRequest.current?.abort(), []);

    const sendQuestion: SubmitHandler<QuestionValues> = async (data) => {
        if (!isDocumentReady || activeRequest.current) return;

        const controller = new AbortController();
        activeRequest.current = controller;
        let turnId: number | null = null;
        let shouldRefresh = false;
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
                .split("; ")
                .find((cookie) => cookie.startsWith("XSRF-TOKEN="));
            if (!csrfCookie) {
                throw new Error(
                    "Your session has expired. Refresh the page and try again.",
                );
            }

            const response = await fetch(ask(documentUuid).url, {
                method: "POST",
                credentials: "same-origin",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    "X-XSRF-TOKEN": decodeURIComponent(
                        csrfCookie.slice("XSRF-TOKEN=".length),
                    ),
                },
                body: JSON.stringify(data),
                signal: controller.signal,
            });

            if (!response.ok) {
                shouldRefresh = response.status >= 500;
                const error = (await response.json().catch(() => null)) as {
                    message?: string;
                    errors?: { question?: string[] };
                } | null;
                if (error?.errors?.question?.[0]) {
                    questionForm.setError("question", {
                        type: "server",
                        message: error.errors.question[0],
                    });
                }

                throw new Error(
                    error?.message ??
                        "Could not send your question. Please try again.",
                );
            }

            if (
                !response.body ||
                !response.headers.get("Content-Type")?.startsWith("text/plain")
            ) {
                throw new Error("The server did not return an answer stream.");
            }

            const responseTurnId = Number(
                response.headers.get("X-Chat-Turn-Id"),
            );
            turnId = responseTurnId > 0 ? responseTurnId : null;
            shouldRefresh = true;
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
            let answer = "";
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
                throw new Error("No answer was returned. Please try again.");
            setPendingTurn((turn) =>
                turn
                    ? { ...turn, answer_status: ProcessingStatusEnum.Completed }
                    : null,
            );
        } catch (error) {
            if (controller.signal.aborted) return;
            questionForm.setError("root.server", {
                type: "server",
                message:
                    error instanceof Error
                        ? error.message
                        : "The connection was interrupted. Please try again.",
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
            if (!controller.signal.aborted && shouldRefresh) {
                await new Promise<void>((resolve) => {
                    router.reload({
                        only: ["history", "documents", "historyPagination"],
                        data: { history_page: 1 },
                        onSuccess: (page) => {
                            if (controller.signal.aborted) return;
                            const history = page.props
                                .history as ChatTurnResponse[];
                            const saved = history.find(
                                (turn) => turn.id === turnId,
                            );
                            if (saved) {
                                setPendingTurn(null);
                                if (
                                    saved.answer_status ===
                                    ProcessingStatusEnum.Failed
                                ) {
                                    questionForm.setError("root.server", {
                                        type: "server",
                                        message:
                                            "The answer was interrupted. Please try again.",
                                    });
                                }
                            }
                        },
                        onFinish: () => resolve(),
                    });
                });
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
    };
}
