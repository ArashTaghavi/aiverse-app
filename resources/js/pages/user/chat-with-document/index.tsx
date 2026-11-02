import { Head } from '@inertiajs/react';
import UserLayout from '../layout';
import DocumentChat from './_components/DocumentChat';
import type { DocumentChatProps } from '@/types';

export default function DocumentChatPage(props: DocumentChatProps) {
    return (
        <>
            <Head title="Chat with document" />
            <DocumentChat {...props} />
        </>
    );
}

DocumentChatPage.layout = UserLayout;
