import { ArrowLeft, FileText } from 'lucide-react';
import { Button } from '@/Modules/Base/Components/UI';

type Props = {
    title?: string;
    hasDocument: boolean;
    onShowConversations: () => void;
};

export default function DocumentChatHeader({
    title,
    hasDocument,
    onShowConversations,
}: Props) {
    return (
        <header className="flex shrink-0 items-center gap-3 border-b border-white/10 bg-[#191923]/95 px-4 py-3 shadow-sm shadow-black/20 sm:px-6">
            <Button
                size="icon"
                variant="secondary"
                className="md:hidden"
                aria-label="Show conversations"
                onClick={onShowConversations}
                startIcon={<ArrowLeft size={18} />}
            />
            <FileText size={24} className="shrink-0 text-violet-300" />
            <div className="min-w-0 flex-1">
                <h2 className="truncate text-sm font-medium" title={title}>
                    {title ?? 'New conversation'}
                </h2>
                <p className="mt-1 text-xs text-ui-muted">
                    {hasDocument
                        ? 'Document ready · One document per chat'
                        : 'Upload a Word document to begin'}
                </p>
            </div>
        </header>
    );
}
