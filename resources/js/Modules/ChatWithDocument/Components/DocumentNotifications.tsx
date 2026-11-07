import type { DocumentNotificationsProps, EmbeddingCompletedPayload } from '@/Modules/ChatWithDocument/Types';
import { useEcho } from "@laravel/echo-react";
import { Bell, CircleCheck, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function DocumentEmbeddingNotifications({
    userId,
}: DocumentNotificationsProps) {
    const [documentIds, setDocumentIds] = useState<number[]>([]);
    const menuRef = useRef<HTMLDetailsElement>(null);

    useEffect(() => {
        const closeOnOutsideClick = (event: PointerEvent) => {
            if (
                event.target instanceof Node &&
                !menuRef.current?.contains(event.target)
            ) {
                menuRef.current?.removeAttribute("open");
            }
        };
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape" && menuRef.current?.open) {
                menuRef.current.removeAttribute("open");
                menuRef.current.querySelector("summary")?.focus();
            }
        };

        document.addEventListener("pointerdown", closeOnOutsideClick);
        document.addEventListener("keydown", closeOnEscape);
        return () => {
            document.removeEventListener("pointerdown", closeOnOutsideClick);
            document.removeEventListener("keydown", closeOnEscape);
        };
    }, []);

    const { channel } = useEcho<EmbeddingCompletedPayload>(
        `chat-with-document.users.${userId}`,
        ".chat-with-document.embedding.completed",
        (event) => {
            setDocumentIds((current) =>
                current.includes(event.document_id)
                    ? current
                    : [...current, event.document_id],
            );
        },
    );

    useEffect(() => {
        if (!import.meta.env.DEV) return;

        console.info("[Document notifications] subscribing", { userId });
        channel()?.subscribed(() => {
            console.info("[Document notifications] subscribed", { userId });
        });
        channel()?.error((error: unknown) => {
            console.error(
                "[Document notifications] subscription failed",
                error,
            );
        });
    }, [channel, userId]);

    return (
        <details ref={menuRef} className="group relative">
            <summary
                aria-label={`Notifications, ${documentIds.length} notifications`}
                className="relative flex size-10 cursor-pointer list-none items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-300 transition-colors group-open:border-violet-400/30 group-open:bg-violet-400/10 group-open:text-violet-200 hover:border-violet-300/30 hover:bg-violet-400/10 hover:text-violet-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-300 [&::-webkit-details-marker]:hidden"
            >
                <Bell size={18} aria-hidden="true" />
                {documentIds.length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex min-w-4.5 items-center justify-center rounded-full bg-violet-400 px-1 text-[10px] leading-4.5 font-bold text-violet-950 ring-2 ring-[#09090e]">
                        {documentIds.length > 99 ? "99+" : documentIds.length}
                    </span>
                )}
            </summary>
            <section
                aria-label="Notifications"
                dir="ltr"
                className="absolute top-full -right-12 z-50 mt-3 w-80 max-w-[calc(100vw-2.5rem)] overflow-hidden rounded-2xl border border-white/10 bg-[#111119] shadow-[0_20px_60px_-12px_#000000cc] sm:right-0"
            >
                <div className="flex items-center justify-between border-b border-white/5 px-4 py-3.5">
                    <h2 className="text-sm font-semibold text-zinc-100">
                        Notifications
                    </h2>
                    <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-zinc-400">
                        {documentIds.length} total
                    </span>
                </div>
                {documentIds.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 px-5 py-10 text-center">
                        <span className="flex size-11 items-center justify-center rounded-full bg-white/5 text-zinc-500">
                            <Bell size={20} aria-hidden="true" />
                        </span>
                        <p className="text-sm text-zinc-400">
                            No notifications yet
                        </p>
                        <p className="text-xs leading-6 text-zinc-500">
                            We’ll let you know when your document is ready.
                        </p>
                    </div>
                ) : (
                    <ul className="max-h-80 divide-y divide-white/5 overflow-y-auto p-2">
                        {[...documentIds].reverse().map((documentId) => (
                            <li
                                key={documentId}
                                className="flex items-start gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-white/5"
                            >
                                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-300">
                                    <CircleCheck size={17} aria-hidden="true" />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-zinc-100">
                                        Document ready
                                    </p>
                                    <p className="mt-1 text-xs leading-6 text-zinc-400">
                                        Document #{documentId} has finished
                                        processing and is ready to chat.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    aria-label={`Dismiss notification for document ${documentId}`}
                                    onClick={() =>
                                        setDocumentIds((current) =>
                                            current.filter(
                                                (id) => id !== documentId,
                                            ),
                                        )
                                    }
                                    className="shrink-0 rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300"
                                >
                                    <X size={16} aria-hidden="true" />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
            <span role="status" className="sr-only">
                {documentIds.length > 0
                    ? `${documentIds.length} document processing notifications`
                    : ""}
            </span>
        </details>
    );
}
