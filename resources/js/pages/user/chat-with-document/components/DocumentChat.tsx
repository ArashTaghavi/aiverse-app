import { usePage } from "@inertiajs/react";
import { useMemo } from "react";
import type { DocumentChatProps } from "@/types";
import DocumentEmbeddingListener from "./DocumentEmbeddingListener";
import DocumentChatSidebar from "./DocumentChatSidebar";
import DocumentChatHeader from "./DocumentChatHeader";
import DocumentUploadPanel from "./DocumentUploadPanel";
import DocumentConversation from "./DocumentConversation";
import useAutoScroll from "../hooks/useAutoScroll";
import useChatNavigation from "../hooks/useChatNavigation";
import useDocumentEmbedding from "../hooks/useDocumentEmbedding";
import useDocumentQuestion from "../hooks/useDocumentQuestion";
import useDocumentUpload from "../hooks/useDocumentUpload";
import DocumentAnswerListener from "./DocumentAnswerListener";

export default function DocumentChat({
    documentId = null,
    documents = [],
    selectedDocument = null,
    history: turns = [],
}: DocumentChatProps) {
    const { auth, errors } = usePage().props;
    const activeId = documentId === null ? null : String(documentId);
    const selected =
        selectedDocument ??
        documents.find((item) => String(item.id) === activeId);
    const { embeddingStatus, isDocumentReady, updateEmbeddingStatus } =
        useDocumentEmbedding(selected);
    const error = errors.form;
    const uploadState = useDocumentUpload(() => questionState.asking);
    const questionState = useDocumentQuestion(
        selected?.uuid ?? null,
        isDocumentReady,
        uploadState.uploading,
        turns.length,
    );
    const { showList, setShowList, newChat, selectChat } = useChatNavigation(
        uploadState.uploading || questionState.asking,
        () => {
            uploadState.closeUploadProgress();
            uploadState.resetUploadForm();
            questionState.questionForm.reset();
        },
    );
    const displayTurns = useMemo(
        () =>
            questionState.pendingTurn
                ? [...turns, questionState.pendingTurn]
                : turns,
        [turns, questionState.pendingTurn],
    );
    const messagesRef = useAutoScroll(
        activeId,
        displayTurns,
        questionState.asking,
    );

    return (
        <div className="flex h-full min-h-0 w-full flex-1 overflow-hidden">
            {auth.user && (
                <DocumentEmbeddingListener
                    userId={auth.user.id}
                    onUpdate={updateEmbeddingStatus}
                />
            )}
            {auth.user && (
                <DocumentAnswerListener
                    userId={auth.user.id}
                    documentId={selected?.id ?? null}
                />
            )}
            <DocumentChatSidebar
                documents={documents}
                activeId={activeId}
                showList={showList}
                busy={uploadState.uploading || questionState.asking}
                newChat={newChat}
                selectChat={selectChat}
            />
            <div
                className={`${showList ? "hidden md:flex" : "flex"} h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden`}
            >
                <DocumentChatHeader
                    title={selected?.title}
                    hasDocument={Boolean(selected)}
                    onShowConversations={() => setShowList(true)}
                />
                {!selected ? (
                    <DocumentUploadPanel
                        userId={auth.user?.id}
                        uploadState={uploadState}
                    />
                ) : (
                    <DocumentConversation
                        document={{
                            document_id: selected.id,
                            original_filename: selected.original_name,
                        }}
                        messagesRef={messagesRef}
                        turns={displayTurns}
                        embeddingStatus={embeddingStatus}
                        isDocumentReady={isDocumentReady}
                        questionState={questionState}
                    />
                )}
                {error && (
                    <p
                        role="alert"
                        className="max-h-24 shrink-0 overflow-y-auto rounded-xl border border-red-400/20 bg-red-400/5 p-3 text-sm text-red-300"
                    >
                        {error}
                    </p>
                )}
            </div>
        </div>
    );
}
