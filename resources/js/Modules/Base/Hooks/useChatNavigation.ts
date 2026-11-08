import { FileChatConfig } from '@/Modules/Base/Types/FileChat';
import { useState, type MouseEvent } from 'react';
import { router } from '@inertiajs/react';

export default function useChatNavigation(
    config: FileChatConfig,
    busy: boolean,
    resetForms: () => void,
) {
    const [showList, setShowList] = useState(false);

    function newChat() {
        if (busy) return;
        router.visit(config.routes.index().url, { preserveScroll: true });
        setShowList(false);
        resetForms();
    }

    function selectChat(event: MouseEvent) {
        if (busy) {
            event.preventDefault();
            return;
        }
        setShowList(false);
    }

    return { showList, setShowList, newChat, selectChat };
}
