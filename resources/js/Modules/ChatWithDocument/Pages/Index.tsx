import { Head } from "@inertiajs/react";
import DocumentChat from "../Components/DocumentChat";
import type { DocumentChatProps } from "@/Modules/ChatWithDocument/Types";
import { UserWorkspaceLayout } from "@/Layouts/UserLayout";
import { Module } from "../Module";

export default function DocumentChatPage(props: DocumentChatProps) {
    return (
        <>
            <Head title={Module.TITLE} />
            <DocumentChat {...props} />
        </>
    );
}

DocumentChatPage.layout = UserWorkspaceLayout;
