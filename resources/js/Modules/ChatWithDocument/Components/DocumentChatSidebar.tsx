import { Link } from '@inertiajs/react';
import { FileText, MessageSquare, Plus } from 'lucide-react';
import { Button } from '@/Modules/Base/Components/UI';
import { index } from '@/actions/App/Modules/ChatWithDocument/Controllers/ChatWithDocumentController';
import type { DocumentResponse } from '@/Modules/ChatWithDocument/Types';
import type useChatNavigation from '../Hooks/useChatNavigation';
import { messageDate } from '../Utils/MessageDates';

type Props = {
    documents: DocumentResponse[];
    activeId: string | null;
    showList: boolean;
    busy: boolean;
    newChat: () => void;
    selectChat: ReturnType<typeof useChatNavigation>['selectChat'];
    pagination: { page: number; hasMore: boolean };
};

export default function DocumentChatSidebar({
    documents,
    activeId,
    showList,
    busy,
    newChat,
    selectChat,
    pagination,
}: Props) {
    const conversations = documents.map((item) => ({
        id: String(item.id),
        title: item.title,
        preview: item.last_message,
        timestamp: item.created_at,
    }));
    return (
        <aside
            aria-label="Conversations"
            className={`${showList ? 'flex' : 'hidden md:flex'} h-full min-h-0 w-full shrink-0 flex-col border-r border-ui-border bg-[#101016] md:w-64 xl:w-80`}
        >
            <div className="shrink-0 space-y-4 border-b border-ui-border p-5">
                <h1 className="flex items-center gap-2 font-semibold">
                    <MessageSquare size={20} className="text-violet-300" />{' '}
                    Document chats
                </h1>
                <Button
                    fullWidth
                    size="sm"
                    onClick={newChat}
                    disabled={busy}
                    startIcon={<Plus size={16} />}
                >
                    New chat
                </Button>
            </div>
            <nav
                aria-label="Chat history"
                className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain p-3"
            >
                {conversations.length === 0 && (
                    <p className="p-3 text-xs text-ui-muted">
                        No conversations yet. Upload a document to start.
                    </p>
                )}
                {conversations.map((chat) => (
                    <Link
                        key={chat.id}
                        href={
                            index({
                                query: {
                                    document_id: chat.id,
                                    documents_page: pagination.page,
                                },
                            }).url
                        }
                        preserveScroll
                        aria-disabled={busy}
                        onClick={selectChat}
                        aria-current={activeId === chat.id ? 'page' : undefined}
                        className={`flex w-full gap-3 rounded-xl p-3 text-left transition focus-visible:outline-2 focus-visible:outline-violet-400 disabled:opacity-60 ${activeId === chat.id ? 'bg-violet-500/15 ring-1 ring-violet-400/20' : 'hover:bg-white/5'}`}
                    >
                        <FileText
                            size={18}
                            className="mt-1 shrink-0 text-violet-300"
                            aria-hidden="true"
                        />
                        <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm text-zinc-200">
                                {chat.title}
                            </span>
                            <span
                                dir="auto"
                                className="mt-1 block truncate text-xs text-ui-secondary"
                            >
                                {chat.preview || 'No messages yet'}
                            </span>
                            {chat.timestamp && (
                                <time
                                    dateTime={chat.timestamp}
                                    title={messageDate(chat.timestamp).full}
                                    className="mt-1 block text-xs text-ui-muted"
                                >
                                    {messageDate(chat.timestamp).time}
                                </time>
                            )}
                        </span>
                    </Link>
                ))}
                <div className="flex justify-between gap-3 p-3 text-sm">
                    {pagination.page > 1 && (
                        <Link
                            onClick={selectChat}
                            href={
                                index({
                                    query: {
                                        document_id: activeId,
                                        documents_page: pagination.page - 1,
                                    },
                                }).url
                            }
                        >
                            Previous
                        </Link>
                    )}
                    {pagination.hasMore && (
                        <Link
                            onClick={selectChat}
                            href={
                                index({
                                    query: {
                                        document_id: activeId,
                                        documents_page: pagination.page + 1,
                                    },
                                }).url
                            }
                        >
                            Next
                        </Link>
                    )}
                </div>
            </nav>
        </aside>
    );
}
