import type { ReactNode, Ref } from 'react';

type Props = {
    messagesRef: Ref<HTMLDivElement>;
    label: string;
    children: ReactNode;
};

export default function ChatMessages({ messagesRef, label, children }: Props) {
    return (
        <div
            ref={messagesRef}
            role="log"
            aria-label={label}
            aria-live="polite"
            aria-relevant="additions text"
            className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain bg-[#0d0e16] bg-[radial-gradient(ellipse_at_top_right,rgba(139,92,246,0.11),transparent_60%),radial-gradient(ellipse_at_bottom_left,rgba(56,189,248,0.05),transparent_55%)] px-2 py-3 sm:px-3"
        >
            {children}
        </div>
    );
}
