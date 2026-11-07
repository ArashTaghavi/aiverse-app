import { ChatHeader } from '@/Modules/Base/Components/Chat';

type Props = {
    title?: string;
    hasDocument: boolean;
    onShowConversations: () => void;
};

export default function DocumentChatHeader({ hasDocument, ...props }: Props) {
    return (
        <ChatHeader
            {...props}
            subtitle={
                hasDocument
                    ? 'Document ready · One document per chat'
                    : 'Upload a Word document to begin'
            }
        />
    );
}
