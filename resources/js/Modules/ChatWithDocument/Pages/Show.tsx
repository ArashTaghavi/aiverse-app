import { Head } from "@inertiajs/react";
import DocumentChat from "../Components/DocumentChat";
import type { DocumentConversationPageProps } from "@/Modules/ChatWithDocument/Types";
import { UserWorkspaceLayout } from "@/Layouts/UserLayout";

export default function DocumentConversationPage(
    props: DocumentConversationPageProps,
) {
    return (
        <>
            <Head title="Document conversation" />
            <DocumentChat key={props.selectedDocument.uuid} {...props} />
        </>
    );
}

DocumentConversationPage.layout = UserWorkspaceLayout;
