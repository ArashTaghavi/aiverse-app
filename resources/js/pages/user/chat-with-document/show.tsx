import { Head } from "@inertiajs/react";
import UserLayout from "../layout";
import DocumentChat from "./components/DocumentChat";
import type { DocumentConversationPageProps } from "@/types";

export default function DocumentConversationPage(props: DocumentConversationPageProps) {
    return (
        <>
            <Head title="Document conversation" />
            <DocumentChat key={props.documentId} {...props} />
        </>
    );
}

DocumentConversationPage.layout = UserLayout;
