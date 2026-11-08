import { ChatSidebar } from "@/Modules/Base/Components/Chat";
import {
    index,
    show,
} from "@/actions/App/Modules/ChatWithDocument/Controllers/ChatWithDocumentController";
import type useChatNavigation from "../Hooks/useChatNavigation";
import { EmbeddableFileResponse } from "@/Modules/Base/Types/Responses/EmbeddableFileResponse";

type Props = {
    data: EmbeddableFileResponse[];
    activeId: string | null;
    showList: boolean;
    busy: boolean;
    newChat: () => void;
    selectChat: ReturnType<typeof useChatNavigation>["selectChat"];
    pagination: { page: number; hasMore: boolean };
};

export default function DocumentChatSidebar({
    data,
    pagination,
    ...props
}: Props) {
    const pageUrl = props.activeId ? show.bind(null, props.activeId) : index;
    const conversations = data.map((d) => ({
        id: d.uuid,
        title: d.title,
        preview: d.last_message,
        timestamp: d.created_at,
        href: show(d.uuid, {
            query: { page: pagination.page },
        }).url,
    }));

    return (
        <ChatSidebar
            {...props}
            conversations={conversations}
            title="Document chats"
            emptyMessage="No conversations yet. Upload a document to start."
            previousPageUrl={
                pagination.page > 1
                    ? pageUrl({
                          query: { page: pagination.page - 1 },
                      }).url
                    : undefined
            }
            nextPageUrl={
                pagination.hasMore
                    ? pageUrl({
                          query: { page: pagination.page + 1 },
                      }).url
                    : undefined
            }
        />
    );
}
