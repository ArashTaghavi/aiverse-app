import { useEcho } from '@laravel/echo-react';
import { Bell, CircleCheck, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { ProcessingStatusEnum } from '../../Enums/ProcessingStatusEnum';
import { UploadProgressEnum } from '../../Enums/UploadProgressEnum';
import type {
    FileChatConfig,
    FileStatusEvent,
    FileUploadProgressEvent,
} from '../../Types/FileChat';

type Notice = { key: string; id: number; title: string };

function ReadyListener({
    config,
    userId,
    onReady,
}: {
    config: FileChatConfig;
    userId: number;
    onReady: (notice: Notice) => void;
}) {
    const handler = useRef(onReady);
    useEffect(() => {
        handler.current = onReady;
    }, [onReady]);
    const channel = `${config.channelPrefix}.${userId}`;
    function ready(id: number) {
        handler.current({
            key: `${config.name}.${id}`,
            id,
            title: config.title,
        });
    }
    useEcho<FileStatusEvent>(
        channel,
        `.${config.events.EmbeddingCompleted}`,
        (event) => {
            const id = event[config.eventId];
            if (id !== undefined) ready(id);
        },
        [config],
    );
    useEcho<FileUploadProgressEvent>(
        channel,
        `.${config.events.UploadProgress}`,
        (event) => {
            if (
                event.step === UploadProgressEnum.Result &&
                event.status === ProcessingStatusEnum.Completed
            )
                ready(event.data.id);
        },
        [config],
    );
    return null;
}

export default function FileNotifications({
    configs,
    userId,
}: {
    configs: FileChatConfig[];
    userId: number;
}) {
    const [notices, setNotices] = useState<Notice[]>([]);
    const menu = useRef<HTMLDetailsElement>(null);
    useEffect(() => {
        function closeOutside(event: PointerEvent) {
            if (
                event.target instanceof Node &&
                !menu.current?.contains(event.target)
            )
                menu.current?.removeAttribute('open');
        }
        function closeEscape(event: KeyboardEvent) {
            if (event.key === 'Escape') menu.current?.removeAttribute('open');
        }
        document.addEventListener('pointerdown', closeOutside);
        document.addEventListener('keydown', closeEscape);
        return () => {
            document.removeEventListener('pointerdown', closeOutside);
            document.removeEventListener('keydown', closeEscape);
        };
    }, []);
    function onReady(notice: Notice) {
        setNotices((current) =>
            current.some((item) => item.key === notice.key)
                ? current
                : [...current, notice],
        );
    }
    return (
        <>
            {configs.map((config) => (
                <ReadyListener
                    key={config.name}
                    config={config}
                    userId={userId}
                    onReady={onReady}
                />
            ))}
            <details ref={menu} className="group relative">
                <summary
                    aria-label={`Notifications, ${notices.length} notifications`}
                    className="relative flex size-10 cursor-pointer list-none items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-300 hover:text-violet-200 focus-visible:outline-2 focus-visible:outline-violet-300 [&::-webkit-details-marker]:hidden"
                >
                    <Bell size={18} />
                    {notices.length > 0 && (
                        <span className="absolute -top-1 -right-1 rounded-full bg-violet-400 px-1.5 text-[10px] text-violet-950">
                            {notices.length}
                        </span>
                    )}
                </summary>
                <section
                    aria-label="Notifications"
                    dir="ltr"
                    className="absolute top-full -right-12 z-50 mt-3 w-80 max-w-[calc(100vw-2.5rem)] overflow-hidden rounded-2xl border border-white/10 bg-[#111119] shadow-xl sm:right-0"
                >
                    <h2 className="border-b border-white/5 px-4 py-3 text-sm font-semibold text-zinc-100">
                        Notifications
                    </h2>
                    {notices.length === 0 ? (
                        <p className="p-8 text-center text-sm text-zinc-400">
                            No notifications yet
                        </p>
                    ) : (
                        <ul className="max-h-80 divide-y divide-white/5 overflow-y-auto p-2">
                            {[...notices].reverse().map((notice) => (
                                <li
                                    key={notice.key}
                                    className="flex items-start gap-3 p-3"
                                >
                                    <CircleCheck
                                        size={18}
                                        className="shrink-0 text-emerald-300"
                                    />
                                    <div className="min-w-0 flex-1 text-sm">
                                        <p className="text-zinc-100">
                                            {notice.title}
                                        </p>
                                        <p className="mt-1 text-xs text-zinc-400">
                                            File #{notice.id} is ready to chat.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        aria-label="Dismiss notification"
                                        onClick={() =>
                                            setNotices((current) =>
                                                current.filter(
                                                    (item) =>
                                                        item.key !== notice.key,
                                                ),
                                            )
                                        }
                                        className="text-zinc-400 hover:text-white"
                                    >
                                        <X size={16} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
                <span role="status" className="sr-only">
                    {notices.length} notifications
                </span>
            </details>
        </>
    );
}
