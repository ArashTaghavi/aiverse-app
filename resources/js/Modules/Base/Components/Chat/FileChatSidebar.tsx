import { FileChatConfig } from '@/Modules/Base/Types/FileChat';
import { ChatSidebar } from '@/Modules/Base/Components/Chat';
import type useChatNavigation from '@/Modules/Base/Hooks/useChatNavigation';
import { EmbeddableFileResponse } from '@/Modules/Base/Types/Responses/EmbeddableFileResponse';

type Props = {
    config: FileChatConfig;
    data: EmbeddableFileResponse[];
    activeId: string | null;
    showList: boolean;
    busy: boolean;
    newChat: () => void;
    selectChat: ReturnType<typeof useChatNavigation>['selectChat'];
    pagination: { page: number; hasMore: boolean };
};

export default function FileChatSidebar({
    config,
    data,
    pagination,
    ...props
}: Props) {
    const pageUrl = props.activeId
        ? config.routes.show.bind(null, props.activeId)
        : config.routes.index;
    const conversations = data.map((d) => ({
        id: d.uuid,
        title: d.title,
        preview: d.last_message,
        timestamp: d.created_at,
        href: config.routes.show(d.uuid, {
            query: { page: pagination.page },
        }).url,
    }));

    return (
        <ChatSidebar
            {...props}
            conversations={conversations}
            title={config.title}
            emptyMessage="No conversations yet. Upload a file to start."
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
