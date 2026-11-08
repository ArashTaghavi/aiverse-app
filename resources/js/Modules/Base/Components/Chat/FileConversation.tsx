import type { Ref } from 'react';
import { FileText } from 'lucide-react';
import type { ChatTurnResponse } from '@/Modules/Base/Types/Chat';
import type useFileQuestion from '@/Modules/Base/Hooks/useFileQuestion';
import { ChatMessages, MessageHistory } from '@/Modules/Base/Components/Chat';
import ChatQuestionForm from './ChatQuestionForm';
import type { EmbeddableFileResponse } from '../../Types/Responses/EmbeddableFileResponse';
import { ProcessingStatusEnum } from '@/Modules/Base/Enums/ProcessingStatusEnum';

type Props = {
    file: EmbeddableFileResponse;
    messagesRef: Ref<HTMLDivElement>;
    turns: ChatTurnResponse[];
    embeddingStatus: ProcessingStatusEnum | undefined;
    isFileReady: boolean;
    questionState: ReturnType<typeof useFileQuestion>;
};

export default function FileConversation({
    file,
    messagesRef,
    turns,
    embeddingStatus,
    isFileReady,
    questionState,
}: Props) {
    const { questionForm, sendQuestion, asking } = questionState;
    return (
        <>
            {file && (
                <div className="flex shrink-0 items-center gap-3 border-b border-emerald-400/20 bg-emerald-400/5 px-4 py-2 text-sm">
                    <FileText
                        size={20}
                        className="shrink-0 text-emerald-300"
                        aria-hidden="true"
                    />
                    <div className="min-w-0">
                        <p
                            className="truncate text-zinc-100"
                            title={file.original_name}
                        >
                            {file.original_name}
                        </p>
                        <p className="mt-1 text-xs text-emerald-300">
                            {isFileReady
                                ? 'File ready'
                                : embeddingStatus ===
                                    ProcessingStatusEnum.Failed
                                  ? 'File preparation failed'
                                  : 'Preparing file'}{' '}
                            · Locked to this conversation
                        </p>
                    </div>
                </div>
            )}
            <ChatMessages messagesRef={messagesRef} label="File conversation">
                {turns.length === 0 && (
                    <p className="py-12 text-center text-sm text-ui-muted">
                        {isFileReady
                            ? 'Your file is ready. Ask your first question below.'
                            : embeddingStatus === ProcessingStatusEnum.Failed
                              ? 'We could not prepare this file.'
                              : 'Processing your file?'}
                    </p>
                )}
                <MessageHistory turns={turns ?? []} />
            </ChatMessages>
            <ChatQuestionForm
                questionForm={questionForm}
                sendQuestion={sendQuestion}
                asking={asking}
                isReady={isFileReady}
                placeholder="Ask something about your file"
            />
        </>
    );
}
