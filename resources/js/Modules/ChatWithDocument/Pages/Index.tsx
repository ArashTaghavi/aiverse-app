import { Head } from '@inertiajs/react';
import { UserWorkspaceLayout } from '../../../Layouts/UserLayout';
import DocumentChat from '../Components/DocumentChat';
import type { DocumentChatProps } from '@/Modules/ChatWithDocument/Types';

export default function DocumentChatPage(props: DocumentChatProps) {
    return (
        <>
            <Head title="Chat with document" />
            <DocumentChat {...props} />
        </>
    );
}

DocumentChatPage.layout = UserWorkspaceLayout;
