import { useState, type MouseEvent } from 'react';
import { router } from '@inertiajs/react';
import { index } from '@/actions/App/Modules/ChatWithDocument/Controllers/ChatWithDocumentController';

export default function useChatNavigation(
    busy: boolean,
    resetForms: () => void,
) {
    const [showList, setShowList] = useState(false);

    function newChat() {
        if (busy) return;
        router.visit(index().url, { preserveScroll: true });
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
