import { FileChatConfig } from "@/Modules/Base/Types/FileChat";
import { usePage } from "@inertiajs/react";
import { useMemo } from "react";
import type { FileConversationPageProps } from "@/Modules/Base/Types/FileChat";
import FileChatEvents from "./FileChatEvents";
import FileChatSidebar from "./FileChatSidebar";
import ChatHeader from "./ChatHeader";
import FileConversation from "./FileConversation";
import useAutoScroll from "@/Modules/Base/Hooks/useAutoScroll";
import useChatNavigation from "@/Modules/Base/Hooks/useChatNavigation";
import useFileEmbedding from "@/Modules/Base/Hooks/useFileEmbedding";
import useFileQuestion from "@/Modules/Base/Hooks/useFileQuestion";

export default function FileChat({
    config,
    data = [],
    selectedData: selected,
    history: turns = [],
    pagination = { page: 1, hasMore: false },
}: FileConversationPageProps & { config: FileChatConfig }) {
    const { auth, errors } = usePage().props;
    const activeId = selected.uuid;
    const { embeddingStatus, isFileReady, updateEmbeddingStatus } = useFileEmbedding(selected);
    const error = errors.form;
    const questionState = useFileQuestion(config, selected.uuid, isFileReady, turns);
    const { showList, setShowList, newChat, selectChat } = useChatNavigation(
        config,
        questionState.asking,
        () => {
            questionState.questionForm.reset();
        },
    );
    const displayTurns = useMemo(
        () =>
            questionState.pendingTurn
                ? [
                      ...turns.filter((turn) => turn.id !== questionState.pendingTurn?.id),
                      questionState.pendingTurn,
                  ]
                : turns,
        [turns, questionState.pendingTurn],
    );
    const messagesRef = useAutoScroll(activeId, displayTurns, questionState.asking);

    return (
        <>
            {auth.user && (
                <FileChatEvents
                    config={config}
                    userId={auth.user.id}
                    fileId={selected.id}
                    onAnswerUpdate={questionState.refreshHistory}
                    onEmbeddingUpdate={updateEmbeddingStatus}
                />
            )}
            <FileChatSidebar
                config={config}
                data={data}
                activeId={activeId}
                showList={showList}
                busy={questionState.asking}
                newChat={newChat}
                selectChat={selectChat}
                pagination={pagination}
            />
            <div
                className={`${showList ? "hidden md:flex" : "flex"} min-h-0 min-w-0 flex-1 flex-col overflow-hidden`}
            >
                <ChatHeader
                    title={selected.title}
                    subtitle="One file per conversation"
                    onShowConversations={() => setShowList(true)}
                />
                <FileConversation
                    file={selected}
                    messagesRef={messagesRef}
                    turns={displayTurns}
                    embeddingStatus={embeddingStatus}
                    isFileReady={isFileReady}
                    questionState={questionState}
                />
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
