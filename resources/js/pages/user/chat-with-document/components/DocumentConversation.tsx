import type { Ref } from 'react';
import { FileText } from 'lucide-react';
import type { ChatTurnResponse, EmbeddingStatus } from '@/types';
import type useDocumentQuestion from '../hooks/useDocumentQuestion';
import MessageHistory from './MessageHistory';
import DocumentQuestionForm from './DocumentQuestionForm';

type Props = {
    document: { document_id: number; original_filename: string };
    messagesRef: Ref<HTMLDivElement>;
    turns: ChatTurnResponse[];
    embeddingStatus: EmbeddingStatus | undefined;
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
                            Document ready · Locked to this conversation
                        </p>
                    </div>
                </div>
            )}
            <div
                ref={messagesRef}
                role="log"
                aria-label="Document conversation"
                aria-live="polite"
                aria-relevant="additions text"
                className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain bg-[#0d0e16] bg-[radial-gradient(ellipse_at_top_right,rgba(139,92,246,0.11),transparent_60%),radial-gradient(ellipse_at_bottom_left,rgba(56,189,248,0.05),transparent_55%)] px-2 py-3 sm:px-3"
            >
                {turns.length === 0 && (
                    <p className="py-12 text-center text-sm text-ui-muted">
                        {isDocumentReady
                            ? 'Your document is ready. Ask your first question below.'
                            : embeddingStatus === 'FAILED'
                              ? 'We could not prepare this document.'
                              : 'Processing your document?'}
                    </p>
                )}
                <MessageHistory turns={turns ?? []} />
            </div>
            <DocumentQuestionForm
                questionForm={questionForm}
                sendQuestion={sendQuestion}
                asking={asking}
                isDocumentReady={isDocumentReady}
            />
        </>
    );
}
