import { Head } from '@inertiajs/react';
import UserLayout from '../layout';
import DatabaseChat from './_components/DatabaseChat';
import type { DatabaseChatProps } from '@/types';

export default function DatabaseAnalystPage(props: DatabaseChatProps) {
    return (
        <>
            <Head title="Database analyst" />
            <DatabaseChat {...props} />
        </>
    );
}

DatabaseAnalystPage.layout = UserLayout;
