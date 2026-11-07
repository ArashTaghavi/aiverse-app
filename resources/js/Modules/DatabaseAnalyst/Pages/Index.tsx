import UserLayout from "@/Layouts/UserLayout";
import { Head } from "@inertiajs/react";
import { Module } from "../Module";
import { DocumentChatSidebar } from "@/Modules/ChatWithDocument/Components";
import { DatabaseAnalystProps } from "../Types";

export default function DatabaseAnalystPage(props: DatabaseAnalystProps) {
    console.log(props);
    return (
        <>
            <Head title={Module.Title} />
            <DocumentChatSidebar
                documents={props.databases}
                activeId={null}
                showList={false}
                busy={false}
                newChat={() => {}}
                selectChat={() => {}}
                pagination={{ page: 1, hasMore: false }}
            />
        </>
    );
}
DatabaseAnalystPage.layout = UserLayout;
