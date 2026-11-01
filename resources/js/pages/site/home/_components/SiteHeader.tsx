import { Link, usePage } from "@inertiajs/react";
import { home, portfolio, auth } from "@/routes";
import { LogIn, Sparkles } from "lucide-react";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { router } from "@inertiajs/react";
import { destroy as logout } from "@/actions/Laravel/Fortify/Http/Controllers/AuthenticatedSessionController";

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
                <Link
                    href={auth()}
                    className="order-2 inline-flex items-center gap-2 justify-self-end rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium whitespace-nowrap text-zinc-100 shadow-[inset_0_1px_0_#ffffff1a,0_4px_16px_#00000020] backdrop-blur-xl transition-colors hover:border-sky-200/40 hover:bg-white/10 hover:text-sky-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-200 sm:order-3"
                >
                    {user ? user.username : "Get started"}
                    <LogIn size={15} aria-hidden="true" />
                </Link>
            </div>
            {user && (
                <button type="button" onClick={() => router.post(logout().url)}>
                    Logout
                </button>
            )}
        </header>
    );
}
