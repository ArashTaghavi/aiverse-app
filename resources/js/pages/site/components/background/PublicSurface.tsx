import type { ReactNode } from "react";
import PublicBackground from "./PublicBackground";

export default function PublicSurface({ children }: { children: ReactNode }) {
    return (
        <div className="relative isolate flex min-h-screen flex-col bg-[#09090e] font-sans text-zinc-100 selection:bg-violet-500/30">
            <div
                aria-hidden="true"
                className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
            >
                <PublicBackground />
            </div>
            {children}
        </div>
    );
}
