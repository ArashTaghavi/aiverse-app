import { useRef } from 'react';
import { usePage } from '@inertiajs/react';
import { ChevronRight, Menu, X } from 'lucide-react';
import Navigation from './Navigation';
import { Link } from '@inertiajs/react';
import { LogOut, UserRound } from 'lucide-react';
import { destroy as logout } from '@/actions/Laravel/Fortify/Http/Controllers/AuthenticatedSessionController';
import DocumentNotifications from '@/Layouts/Components/User/FileChatNotifications';
import { getPageLabel } from '@/Utils/PageLabel';

export default function Header() {
    const user = usePage().props.auth.user;
    const pageLabel = getPageLabel(usePage().url);
    const mobileMenu = useRef<HTMLDialogElement>(null);

    return (
        <>
            <dialog
                ref={mobileMenu}
                aria-labelledby="mobile-menu-title"
                className="fixed inset-y-0 right-auto left-0 m-0 h-dvh max-h-none w-72 max-w-[85vw] border-r border-ui-border bg-[#101016] p-6 text-zinc-100 backdrop:bg-black/70 lg:hidden"
            >
                <div className="mb-10 flex items-center justify-between gap-2">
                    <h2
                        id="mobile-menu-title"
                        className="text-sm font-semibold"
                    >
                        User workspace
                    </h2>
                    <button
                        type="button"
                        onClick={() => mobileMenu.current?.close()}
                        aria-label="Close menu"
                        className="rounded-lg p-2 text-ui-secondary hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-violet-400"
                    >
                        <X size={20} />
                    </button>
                </div>
                <Navigation onNavigate={() => mobileMenu.current?.close()} />
            </dialog>
            <header className="sticky top-0 z-20 flex min-h-20 items-center justify-between gap-4 border-b border-ui-border-subtle bg-[#0c0c11]/90 px-5 backdrop-blur-xl sm:px-8 lg:px-10">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => mobileMenu.current?.showModal()}
                        aria-label="Open navigation menu"
                        aria-haspopup="dialog"
                        className="rounded-lg p-2 text-ui-secondary hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-violet-400 lg:hidden"
                    >
                        <Menu size={20} />
                    </button>
                    <span className="hidden text-xs text-ui-muted sm:inline">
                        Workspace
                    </span>
                    <ChevronRight
                        size={13}
                        className="hidden text-ui-dim sm:block"
                        aria-hidden="true"
                    />
                    <span className="text-xs font-medium text-zinc-200">
                        {pageLabel}
                    </span>
                </div>
                <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                    <span className="hidden max-w-32 items-center gap-2 text-xs text-ui-secondary sm:inline-flex">
                        <UserRound
                            size={16}
                            className="shrink-0 text-violet-300"
                            aria-hidden="true"
                        />
                        <span className="truncate">
                            {typeof user.username === 'string'
                                ? user.username
                                : user.name}
                        </span>
                    </span>
                    <DocumentNotifications key={user.id} userId={user.id} />
                    <Link
                        href={logout()}
                        as="button"
                        aria-label="Log out"
                        title="Log out"
                        className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-zinc-400 transition-colors hover:border-rose-300/25 hover:bg-rose-400/10 hover:text-rose-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-rose-300"
                    >
                        <LogOut size={17} aria-hidden="true" />
                        <span className="hidden sm:inline">Log out</span>
                    </Link>
                </div>
            </header>
        </>
    );
}
