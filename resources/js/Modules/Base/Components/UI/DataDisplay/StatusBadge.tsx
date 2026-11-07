import type { ReactNode } from "react";

export type StatusTone = "success" | "warning" | "danger" | "neutral";
const colors: Record<StatusTone, string> = {
    success: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    warning: "border-amber-400/20 bg-amber-400/10 text-amber-300",
    danger: "border-red-400/20 bg-red-400/10 text-red-300",
    neutral: "border-ui-border bg-white/5 text-ui-secondary",
};

export default function StatusBadge({
    children,
    tone = "neutral",
}: {
    children: ReactNode;
    tone?: StatusTone;
}) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[10px] font-medium whitespace-nowrap ${colors[tone]}`}
        >
            <span
                className="size-1.5 rounded-full bg-current"
                aria-hidden="true"
            />
            {children}
        </span>
    );
}
