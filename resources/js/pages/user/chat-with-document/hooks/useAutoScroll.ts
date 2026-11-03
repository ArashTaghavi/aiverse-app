import { useEffect, useRef } from 'react';
import type { ChatTurnResponse } from '@/types';

export default function useAutoScroll(
    activeId: string | null,
    turns: ChatTurnResponse[],
    asking: boolean,
) {
    const messagesRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const messages = messagesRef.current;
        if (messages) messages.scrollTop = messages.scrollHeight;
    }, [activeId, turns, asking]);

    return messagesRef;
}
