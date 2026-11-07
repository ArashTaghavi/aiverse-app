import { Head } from '@inertiajs/react';
import { UserWorkspaceLayout } from '../layout';
import DocumentChat from './components/DocumentChat';
import type { DocumentChatProps } from '@/types';

export default function DocumentChatPage(props: DocumentChatProps) {
    return (
        <>
            <Head title="Chat with document" />
            <DocumentChat {...props} />
        </>
    );
}

DocumentChatPage.layout = UserWorkspaceLayout;
