import { Head, usePage } from "@inertiajs/react";
import DocumentChatSidebar from "../Components/DocumentChatSidebar";
import DocumentChatHeader from "../Components/DocumentChatHeader";
import DocumentUploadPanel from "../Components/DocumentUploadPanel";
import useDocumentUpload from "../Hooks/useDocumentUpload";
import useChatNavigation from "../Hooks/useChatNavigation";
import type { DocumentChatProps } from "@/Modules/ChatWithDocument/Types";
import { UserWorkspaceLayout } from "@/Layouts/UserLayout";
import { Module } from "../Module";

export default function DocumentChatPage(props: DocumentChatProps) {
    const { auth, errors } = usePage().props;
    const uploadState = useDocumentUpload(() => false);
    const { showList, setShowList, newChat, selectChat } = useChatNavigation(
        uploadState.uploading,
        () => {
            uploadState.closeUploadProgress();
            uploadState.resetUploadForm();
        },
    );

    return (
        <>
            <Head title={Module.TITLE} />
            <DocumentChatSidebar
                documents={props.documents}
                activeId={null}
                showList={showList}
                busy={uploadState.uploading}
                newChat={newChat}
                selectChat={selectChat}
                pagination={props.documentsPagination}
            />
            <div
                className={`${showList ? "hidden md:flex" : "flex"} min-h-0 min-w-0 flex-1 flex-col overflow-hidden`}
            >
                <DocumentChatHeader
                    hasDocument={false}
                    onShowConversations={() => setShowList(true)}
                />
                <DocumentUploadPanel
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

DocumentChatPage.layout = UserWorkspaceLayout;
