import { Link, usePage } from "@inertiajs/react";
import { useConnectionStatus, useEcho } from "@laravel/echo-react";
import { home, portfolio, auth } from "@/routes";
import {
    Bell,
    CircleCheck,
    LogIn,
    LogOut,
    Sparkles,
    UserRound,
    X,
} from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { router } from "@inertiajs/react";
import { destroy as logout } from "@/actions/Laravel/Fortify/Http/Controllers/AuthenticatedSessionController";

type EmbeddingCompletedPayload = {
    document_id: number;
    embedding_status: "COMPLETED";
};

function DocumentEmbeddingNotifications({ userId }: { userId: number }) {
    const [documentIds, setDocumentIds] = useState<number[]>([]);
    const menuRef = useRef<HTMLDetailsElement>(null);
    const connectionStatus = useConnectionStatus();

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
            console.log("ok", event);
            setDocumentIds((current) =>
                current.includes(event.document_id)
                    ? current
                    : [...current, event.document_id],
            );
        },
    );

    useEffect(() => {
        if (!import.meta.env.DEV) return;

        console.info("[Document notifications] connection", connectionStatus);
    }, [connectionStatus]);

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

function subscribeToScroll(onChange: () => void) {
    window.addEventListener("scroll", onChange, { passive: true });
    return () => window.removeEventListener("scroll", onChange);
}

function getScrolled() {
    return window.scrollY > 24;
}

function getServerScrolled() {
    return false;
}

export default function SiteHeader() {
    const page = usePage();
    const user = page.props.auth.user;

    useEffect(() => {
        if (!import.meta.env.DEV) return;

        console.info("[SiteHeader] mounted", { userId: user?.id ?? null });
    }, [user?.id]);

    const pathname = usePage().url.split(/[?#]/)[0];
    const headerRef = useRef<HTMLElement>(null);
    const scrolled = useSyncExternalStore(
        subscribeToScroll,
        getScrolled,
        getServerScrolled,
    );
    useEffect(() => {
        const header = headerRef.current;
        const page = header?.parentElement;
        if (!header || !page) return;
        const updateHeight = () => {
            page.style.setProperty(
                "--site-header-height",
                `${header.getBoundingClientRect().height}px`,
            );
        };
        updateHeight();
        const observer = new ResizeObserver(updateHeight);
        observer.observe(header);
        return () => observer.disconnect();
    }, []);

    return (
        <header
            ref={headerRef}
            className={`sticky top-0 z-50 border-b transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300 motion-reduce:transition-none ${
                scrolled
                    ? "border-violet-300/15 bg-[#09090e]/85 shadow-[0_8px_32px_-12px_#000000b3] backdrop-blur-xl"
                    : "border-white/5 bg-transparent"
            }`}
        >
            <div className="grid w-full grid-cols-[1fr_auto] items-center gap-4 px-5 py-5 sm:grid-cols-[1fr_auto_1fr] sm:px-10 lg:px-16 xl:px-24">
                <Link
                    href={home()}
                    aria-label="OpenLearnLab home"
                    className="order-1 inline-flex w-fit items-center gap-2.5 text-sm font-semibold tracking-tight text-zinc-100 sm:text-base"
                >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-400/10 text-violet-300">
                        <Sparkles size={19} aria-hidden="true" />
                    </span>
                    OpenLearnLab
                </Link>
                <nav
                    aria-label="Main navigation"
                    className="order-3 col-span-2 flex items-center justify-center gap-8 text-sm text-zinc-400 sm:order-2 sm:col-span-1"
                >
                    <Link
                        href={home()}
                        aria-current={pathname === "/" ? "page" : undefined}
                        className={
                            pathname === "/"
                                ? "text-violet-300 hover:text-violet-200"
                                : "transition-colors hover:text-white"
                        }
                    >
                        Home
                    </Link>
                    <Link
                        href={portfolio()}
                        aria-current={
                            pathname === "/portfolio" ? "page" : undefined
                        }
                        className={
                            pathname === "/portfolio"
                                ? "text-violet-300 hover:text-violet-200"
                                : "transition-colors hover:text-white"
                        }
                    >
                        Portfolio
                    </Link>
                </nav>
                <div className="order-2 flex items-center gap-2 justify-self-end sm:order-3 sm:gap-3">
                    {user ? (
                        <>
                            <span className="hidden max-w-32 items-center gap-2 text-sm text-zinc-300 lg:inline-flex">
                                <UserRound
                                    size={16}
                                    className="shrink-0 text-violet-300"
                                    aria-hidden="true"
                                />
                                <span className="truncate">
                                    {typeof user.username === "string"
                                        ? user.username
                                        : user.name}
                                </span>
                            </span>
                            <DocumentEmbeddingNotifications
                                key={user.id}
                                userId={user.id}
                            />
                            <button
                                type="button"
                                onClick={() => router.post(logout().url)}
                                aria-label="Log out"
                                title="Log out"
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-zinc-400 transition-colors hover:border-rose-300/25 hover:bg-rose-400/10 hover:text-rose-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-rose-300"
                            >
                                <LogOut size={17} aria-hidden="true" />
                                <span className="hidden sm:inline">
                                    Log out
                                </span>
                            </button>
                        </>
                    ) : (
                        <Link
                            href={auth()}
                            className="order-2 inline-flex items-center gap-2 justify-self-end rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium whitespace-nowrap text-zinc-100 shadow-[inset_0_1px_0_#ffffff1a,0_4px_16px_#00000020] backdrop-blur-xl transition-colors hover:border-sky-200/40 hover:bg-white/10 hover:text-sky-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-200 sm:order-3"
                        >
                            Get started
                            <LogIn size={15} aria-hidden="true" />
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}
