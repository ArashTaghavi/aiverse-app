import type { UserLayoutProps } from '@/types/UserPanel';
import Header from './Components/User/Header';
import Aside from './Components/User/Aside';
import styles from './UserLayout.module.css';

export default function UserLayout({
    children,
    contentMode = 'page',
}: UserLayoutProps) {
    return (
        <div
            data-user-viewport="true"
            className="user-theme fixed inset-0 h-dvh max-h-dvh overflow-hidden bg-[#0c0c11] font-sans text-zinc-100 selection:bg-violet-500/30"
        >
            <a
                href="#dashboard-content"
                className="sr-only z-50 rounded-lg bg-violet-500 px-4 py-3 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
            >
                Skip to content
            </a>
            <Aside />

            <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden lg:pl-64 [&>header]:shrink-0">
                <Header />
                <main
                    id="dashboard-content"
                    tabIndex={-1}
                    className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-linear-to-br from-white/[0.035] via-[#111117] to-white/[0.015] outline-none"
                >
                    <div
                        aria-hidden="true"
                        className={`${styles.edgeShine} pointer-events-none absolute inset-x-6 top-0 z-10 h-px overflow-hidden bg-linear-to-r from-transparent via-violet-300 to-transparent shadow-[0_0_18px_2px_#8b5cf670]`}
                    />
                    <div
                        className={`flex min-h-0 min-w-0 flex-1 ${contentMode === 'workspace' ? 'overflow-hidden' : 'flex-col gap-6 overflow-y-auto overscroll-contain p-4 sm:p-6'}`}
                    >
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

export function UserWorkspaceLayout({ children }: UserLayoutProps) {
    return <UserLayout contentMode="workspace">{children}</UserLayout>;
}
