import FileNotifications from '@/Modules/Base/Components/Chat/FileNotifications';
import { ChatConfig as documentChat } from '@/Modules/ChatWithDocument/ChatConfig';
import { ChatConfig as databaseChat } from '@/Modules/DatabaseAnalyst/ChatConfig';

const configs = [documentChat, databaseChat];

export default function FileChatNotifications({ userId }: { userId: number }) {
    return <FileNotifications configs={configs} userId={userId} />;
}
