import { Head } from '@inertiajs/react';
import { UserWorkspaceLayout } from '@/Layouts/UserLayout';
import FileChat from '@/Modules/Base/Components/Chat/FileChat';
import type { FileConversationPageProps } from '@/Modules/Base/Types/FileChat';
import { ChatConfig } from '../ChatConfig';

export default function Show(props: FileConversationPageProps) {
    return (
        <>
            <Head title={ChatConfig.title} />
            <FileChat
                key={props.selectedData.uuid}
                config={ChatConfig}
                {...props}
            />
        </>
    );
}

Show.layout = UserWorkspaceLayout;
