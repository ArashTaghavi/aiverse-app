import { AnswerStatusEnum } from '@/Modules/Base/Enums/AnswerStatusEnum';
import { Link, usePage, usePoll } from '@inertiajs/react';
import { useEffect, useMemo } from 'react';
import { index } from '@/actions/App/Modules/ChatWithDocument/Controllers/ChatWithDocumentController';
import type { DocumentChatProps } from '@/Modules/ChatWithDocument/Types';
import DocumentEmbeddingListener from './DocumentEmbeddingListener';
import DocumentChatSidebar from './DocumentChatSidebar';
import DocumentChatHeader from './DocumentChatHeader';
import DocumentUploadPanel from './DocumentUploadPanel';
import DocumentConversation from './DocumentConversation';
import useAutoScroll from '../Hooks/useAutoScroll';
import useChatNavigation from '../Hooks/useChatNavigation';
import useDocumentEmbedding from '../Hooks/useDocumentEmbedding';
import useDocumentQuestion from '../Hooks/useDocumentQuestion';
import useDocumentUpload from '../Hooks/useDocumentUpload';
import DocumentAnswerListener from './DocumentAnswerListener';

export default function DocumentChat({
    documentId = null,
    documents = [],
    selectedDocument = null,
    history: turns = [],
    documentsPagination = { page: 1, hasMore: false },
    historyPagination = { page: 1, hasMore: false },
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
    const { start, stop } = usePoll(
        5000,
        {
            only: [
                'history',
                'documents',
                'selectedDocument',
                'historyPagination',
                'documentsPagination',
            ],
        },
        { autoStart: false },
    );
    const awaitingUpdate =
        selected?.embedding_status === 'PENDING' ||
        selected?.embedding_status === 'PROCESSING' ||
        documents.some(
            (document) =>
                document.embedding_status === 'PENDING' ||
                document.embedding_status === 'PROCESSING',
        ) ||
        turns.some(
            (turn) =>
                turn.answer_status === AnswerStatusEnum.Pending ||
                turn.answer_status === AnswerStatusEnum.Processing,
        );
    useEffect(() => {
        if (awaitingUpdate) start();
        else stop();
        return stop;
    }, [awaitingUpdate, start, stop]);

    return (
        <>
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
                pagination={documentsPagination}
            />
            <div
                className={`${showList ? 'hidden md:flex' : 'flex'} min-h-0 min-w-0 flex-1 flex-col overflow-hidden`}
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
                    <>
                        {(historyPagination.page > 1 ||
                            historyPagination.hasMore) && (
                            <div className="flex justify-between gap-3 p-3 text-sm">
                                {historyPagination.hasMore && (
                                    <Link
                                        onClick={selectChat}
                                        href={
                                            index({
                                                query: {
                                                    document_id: selected.id,
                                                    documents_page:
                                                        documentsPagination.page,
                                                    history_page:
                                                        historyPagination.page +
                                                        1,
                                                },
                                            }).url
                                        }
                                    >
                                        Older messages
                                    </Link>
                                )}
                                {historyPagination.page > 1 && (
                                    <Link
                                        onClick={selectChat}
                                        href={
                                            index({
                                                query: {
                                                    document_id: selected.id,
                                                    documents_page:
                                                        documentsPagination.page,
                                                    history_page:
                                                        historyPagination.page -
                                                        1,
                                                },
                                            }).url
                                        }
                                    >
                                        Newer messages
                                    </Link>
                                )}
                            </div>
                        )}
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
                    </>
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
        </>
    );
}
