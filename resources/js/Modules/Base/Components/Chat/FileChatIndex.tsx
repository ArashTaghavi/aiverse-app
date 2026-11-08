import { usePage } from '@inertiajs/react';
import FileChatSidebar from './FileChatSidebar';
import ChatHeader from './ChatHeader';
import FileUploadPanel from './FileUploadPanel';
import useFileUpload from '../../Hooks/useFileUpload';
import useChatNavigation from '../../Hooks/useChatNavigation';
import type { FileChatConfig, FileChatPageProps } from '../../Types/FileChat';
export default function FileChatIndex({
    config,
    ...props
}: FileChatPageProps & { config: FileChatConfig }) {
    const { auth, errors } = usePage().props;
    const uploadState = useFileUpload(config);
    const { showList, setShowList, newChat, selectChat } = useChatNavigation(
        config,
        uploadState.uploading,
        () => {
            uploadState.closeUploadProgress();
            uploadState.resetUploadForm();
        },
    );

    return (
        <>
            <FileChatSidebar
                config={config}
                data={props.data}
                activeId={null}
                showList={showList}
                busy={uploadState.uploading}
                newChat={newChat}
                selectChat={selectChat}
                pagination={props.pagination}
            />
            <div
                className={`${showList ? 'hidden md:flex' : 'flex'} min-h-0 min-w-0 flex-1 flex-col overflow-hidden`}
            >
                <ChatHeader
                    subtitle={`Upload a ${config.file.label.toLowerCase()} to begin`}
                    onShowConversations={() => setShowList(true)}
                />
                <FileUploadPanel
                    config={config}
                    userId={auth.user?.id}
                    uploadState={uploadState}
                />
                {errors.form && (
                    <p
                        role="alert"
                        className="max-h-24 shrink-0 overflow-y-auto rounded-xl border border-red-400/20 bg-red-400/5 p-3 text-sm text-red-300"
                    >
                        {errors.form}
                    </p>
                )}
            </div>
        </>
    );
}
