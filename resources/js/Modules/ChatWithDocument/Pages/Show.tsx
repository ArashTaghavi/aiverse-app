import { Head } from '@inertiajs/react';
import { UserWorkspaceLayout } from '../../../Layouts/UserLayout';
import DocumentChat from '../Components/DocumentChat';
import type { DocumentConversationPageProps } from '@/Modules/ChatWithDocument/Types';

export default function DocumentConversationPage(
    props: DocumentConversationPageProps,
) {
    return (
        <>
            <Head title="Document conversation" />
            <DocumentChat key={props.documentId} {...props} />
        </>
    );
}

DocumentConversationPage.layout = UserWorkspaceLayout;
