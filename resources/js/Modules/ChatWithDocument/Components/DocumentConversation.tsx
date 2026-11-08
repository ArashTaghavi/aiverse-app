import type { Ref } from "react";
import { FileText } from "lucide-react";
import type { ChatTurnResponse } from "@/Modules/ChatWithDocument/Types";
import type useDocumentQuestion from "../Hooks/useDocumentQuestion";
import { ChatMessages, MessageHistory } from "@/Modules/Base/Components/Chat";
import DocumentQuestionForm from "./DocumentQuestionForm";
import { ProcessingStatusEnum } from "@/Modules/Base/Enums/ProcessingStatusEnum";

type Props = {
    document: { document_id: number; original_filename: string };
    messagesRef: Ref<HTMLDivElement>;
    turns: ChatTurnResponse[];
    embeddingStatus: ProcessingStatusEnum | undefined;
    isDocumentReady: boolean;
    questionState: ReturnType<typeof useDocumentQuestion>;
};

export default function DocumentConversation({
    document,
    messagesRef,
    turns,
    embeddingStatus,
    isDocumentReady,
    questionState,
}: Props) {
    const { questionForm, sendQuestion, asking } = questionState;
    return (
        <>
            {document && (
                <div className="flex shrink-0 items-center gap-3 border-b border-emerald-400/20 bg-emerald-400/5 px-4 py-2 text-sm">
                    <FileText
                        size={20}
                        className="shrink-0 text-emerald-300"
                        aria-hidden="true"
                    />
                    <div className="min-w-0">
                        <p
                            className="truncate text-zinc-100"
                            title={document.original_filename}
                        >
                            {document.original_filename}
                        </p>
                        <p className="mt-1 text-xs text-emerald-300">
                            {isDocumentReady
                                ? "Document ready"
                                : embeddingStatus === "FAILED"
                                  ? "Document preparation failed"
                                  : "Preparing document"}{" "}
                            · Locked to this conversation
                        </p>
                    </div>
                </div>
            )}
            <ChatMessages
                messagesRef={messagesRef}
                label="Document conversation"
            >
                {turns.length === 0 && (
                    <p className="py-12 text-center text-sm text-ui-muted">
                        {isDocumentReady
                            ? "Your document is ready. Ask your first question below."
                            : embeddingStatus === "FAILED"
                              ? "We could not prepare this document."
                              : "Processing your document?"}
                    </p>
                )}
                <MessageHistory turns={turns ?? []} />
            </ChatMessages>
            <DocumentQuestionForm
                questionForm={questionForm}
                sendQuestion={sendQuestion}
                asking={asking}
                isDocumentReady={isDocumentReady}
            />
        </>
    );
}
