import { Head } from '@inertiajs/react';
import { UserWorkspaceLayout } from '@/Layouts/UserLayout';
import FileChatIndex from '@/Modules/Base/Components/Chat/FileChatIndex';
import type { FileChatPageProps } from '@/Modules/Base/Types/FileChat';
import { ChatConfig } from '../ChatConfig';

export default function Index(props: FileChatPageProps) {
    return (
        <>
            <Head title={ChatConfig.title} />
            <FileChatIndex config={ChatConfig} {...props} />
        </>
    );
}

Index.layout = UserWorkspaceLayout;
