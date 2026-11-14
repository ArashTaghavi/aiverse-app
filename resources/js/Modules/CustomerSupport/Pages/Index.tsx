import { Head } from '@inertiajs/react';
import { UserWorkspaceLayout } from '@/Layouts/UserLayout';
import type { FileChatPageProps } from '@/Modules/Base/Types/FileChat';
import { Module } from '../Module';
import { Tab } from '@/Modules/CustomerSupport/Components';

export default function Index(props: FileChatPageProps) {
    return (
        <>
            <Head title={Module.Title} />
            <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden p-5">
                <Tab />
            </div>
        </>
    );
}

Index.layout = UserWorkspaceLayout;
