import { Link, usePage } from '@inertiajs/react';
import { useMemo } from 'react';
import { show } from '@/actions/App/Modules/ChatWithDocument/Controllers/ChatWithDocumentController';
import type { DocumentConversationPageProps } from '@/Modules/ChatWithDocument/Types';
import DocumentEmbeddingListener from './DocumentEmbeddingListener';
import DocumentChatSidebar from './DocumentChatSidebar';
import DocumentChatHeader from './DocumentChatHeader';
import DocumentConversation from './DocumentConversation';
import useAutoScroll from '@/Modules/Base/Hooks/useAutoScroll';
import useChatNavigation from '../Hooks/useChatNavigation';
import useDocumentEmbedding from '../Hooks/useDocumentEmbedding';
import useDocumentQuestion from '../Hooks/useDocumentQuestion';
import DocumentAnswerListener from './DocumentAnswerListener';

export default function DocumentChat({
    documents = [],
    selectedDocument: selected,
    history: turns = [],
    documentsPagination = { page: 1, hasMore: false },
    historyPagination = { page: 1, hasMore: false },
}: DocumentConversationPageProps) {
    const { auth, errors } = usePage().props;
    const activeId = selected.uuid;
    const { embeddingStatus, isDocumentReady, updateEmbeddingStatus } =
        useDocumentEmbedding(selected);
    const error = errors.form;
    const questionState = useDocumentQuestion(selected.uuid, isDocumentReady);
    const { showList, setShowList, newChat, selectChat } = useChatNavigation(
        questionState.asking,
        () => {
            questionState.questionForm.reset();
        },
    );
    const displayTurns = useMemo(
        () =>
            questionState.pendingTurn
                ? [
                      ...turns.filter(
                          (turn) => turn.id !== questionState.pendingTurn?.id,
                      ),
                      questionState.pendingTurn,
                  ]
                : turns,
        [turns, questionState.pendingTurn],
    );
    const messagesRef = useAutoScroll(
        activeId,
        displayTurns,
        questionState.asking,
    );

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
                    documentId={selected.id}
                />
            )}
            <DocumentChatSidebar
                documents={documents}
                activeId={activeId}
                showList={showList}
                busy={questionState.asking}
                newChat={newChat}
                selectChat={selectChat}
                pagination={documentsPagination}
            />
            <div
                className={`${showList ? 'hidden md:flex' : 'flex'} min-h-0 min-w-0 flex-1 flex-col overflow-hidden`}
            >
                <DocumentChatHeader
                    title={selected.title}
                    hasDocument
                    onShowConversations={() => setShowList(true)}
                />
                <>
                    {(historyPagination.page > 1 ||
                        historyPagination.hasMore) && (
                        <div className="flex justify-between gap-3 p-3 text-sm">
                            {historyPagination.hasMore && (
                                <Link
                                    onClick={selectChat}
                                    href={
                                        show(selected.uuid, {
                                            query: {
                                                documents_page:
                                                    documentsPagination.page,
                                                history_page:
                                                    historyPagination.page + 1,
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
                                        show(selected.uuid, {
                                            query: {
                                                documents_page:
                                                    documentsPagination.page,
                                                history_page:
                                                    historyPagination.page - 1,
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
