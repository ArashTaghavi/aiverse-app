import type { UserLayoutProps } from "@/types";
import Header from "./_components/layout/Header";
import Aside from "./_components/layout/Aside";
import Main from "./_components/layout/Main";

export default function UserLayout({ children }: UserLayoutProps) {
    return (
        <div
            data-chat-viewport="true"
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
                <Main viewport>{children}</Main>
            </div>
        </div>
    );
}
