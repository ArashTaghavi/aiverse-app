import { index as chatWithDocument } from "@/actions/App/Modules/ChatWithDocument/Controllers/ChatWithDocumentController";
import { index as dashboard } from "@/actions/App/Http/Controllers/User/DashboardController";
import { Link } from "@inertiajs/react";
import { usePage } from "@inertiajs/react";
import type { UserNavigationProps } from "@/types";
import {
    ChevronRight,
    Database,
    FileText,
    LayoutDashboard,
} from "lucide-react";

const items = [
    {
        label: "Dashboard",
        href: dashboard().url,
        icon: LayoutDashboard,
    },
    {
        label: "Chat with Document",
        href: chatWithDocument().url,
        icon: FileText,
    },
    {
        label: "Database Analyst",
        href: null,
        icon: Database,
    },
];

export default function Navigation({ onNavigate }: UserNavigationProps) {
    const pathname = usePage().url.split(/[?#]/)[0];

    return (
        <nav aria-label="Dashboard navigation" className="space-y-2">
            <p className="mb-4 px-3 text-[10px] font-semibold tracking-[0.18em] text-ui-muted uppercase">
                Workspace
            </p>
            {items.map(({ label, href, icon: Icon }) => {
                if (href === null) {
                    return (
                        <span
                            key={label}
                            aria-disabled="true"
                            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-ui-muted"
                        >
                            <Icon
                                size={18}
                                className="shrink-0"
                                aria-hidden="true"
                            />
                            {label}
                        </span>
                    );
                }

                const active =
                    pathname === href || pathname.startsWith(`${href}/`);
                return (
                    <Link
                        key={href}
                        href={href}
                        onClick={onNavigate}
                        aria-current={active ? "page" : undefined}
                        className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-violet-400 ${active ? "bg-violet-400/10 text-violet-300 ring-1 ring-violet-400/15" : "text-ui-secondary hover:bg-white/5 hover:text-white"}`}
                    >
                        <Icon
                            size={18}
                            className="shrink-0"
                            aria-hidden="true"
                        />{" "}
                        {label}
                        <ChevronRight
                            size={14}
                            className="ml-auto"
                            aria-hidden="true"
                        />
                    </Link>
                );
            })}
        </nav>
    );
}
