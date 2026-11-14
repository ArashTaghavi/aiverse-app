import { Head } from '@inertiajs/react';
import { UserWorkspaceLayout } from '@/Layouts/UserLayout';
import { Module } from '../Module';
import { Tab } from '@/Modules/CustomerSupport/Components';

export default function Index() {
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
