import { AnswerStatusEnum } from '@/Modules/Base/Enums/AnswerStatusEnum';
import { useState } from "react";
import { router } from "@inertiajs/react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ask } from "@/actions/App/Modules/ChatWithDocument/Controllers/ChatWithDocumentController";
import type { ChatTurnResponse, DocumentQuestionValues } from '@/Modules/ChatWithDocument/Types';
import { documentQuestionSchema } from "../Schemas/QuestionSchema";

export default function useDocumentQuestion(
    documentUuid: string | null,
    isDocumentReady: boolean,
    uploading: boolean,
    turnCount: number,
) {
    const [asking, setAsking] = useState(false);
    const [submittedTurnCount, setSubmittedTurnCount] = useState(0);
    const [pendingTurn, setPendingTurn] = useState<ChatTurnResponse | null>(
        null,
    );
    const questionForm = useForm<DocumentQuestionValues>({
        resolver: zodResolver(documentQuestionSchema),
        defaultValues: { question: "" },
    });

    const sendQuestion: SubmitHandler<DocumentQuestionValues> = (data) => {
        if (documentUuid === null || !isDocumentReady || uploading || asking)
            return;
        router.post(ask(documentUuid).url, data, {
            preserveScroll: true,
            onStart: () => {
                setSubmittedTurnCount(turnCount);
                setPendingTurn({
                    id: -Date.now(),
                    question: data.question,
                    answer: null,
                    answer_status: AnswerStatusEnum.Pending,
                    created_at: new Date().toISOString(),
                });
                setAsking(true);
            },
            onFinish: () => {
                setAsking(false);
                setPendingTurn(null);
            },
            onSuccess: () => questionForm.reset(),
            onError: (errors) => {
                if (errors.question) {
                    questionForm.setError("question", {
                        type: "server",
                        message: errors.question,
                    });
                }
            },
        });
    };

    return {
        questionForm,
        asking,
        sendQuestion,
        pendingTurn:
            asking && turnCount === submittedTurnCount ? pendingTurn : null,
    };
}
