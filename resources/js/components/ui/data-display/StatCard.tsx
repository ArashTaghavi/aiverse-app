import type { ReactNode } from "react";

export interface StatCardProps {
    label: string;
    value: ReactNode;
    icon?: ReactNode;
    detail?: string;
    trend?: { label: string; positive: boolean };
}

export default function StatCard({
    label,
    value,
    icon,
    detail,
    trend,
}: StatCardProps) {
    return (
        <div className="relative overflow-hidden rounded-2xl border border-ui-border bg-linear-to-br from-white/[0.045] to-transparent p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-ui-secondary">{label}</p>
                {icon && (
                    <span
                        aria-hidden="true"
                        className="text-violet-300/80 [&>svg]:size-4"
                    >
                        {icon}
                    </span>
                )}
            </div>
            <p className="mt-4 text-2xl font-semibold tracking-tight text-zinc-100 tabular-nums">
                {value}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
                {trend && (
                    <span
                        className={
                            trend.positive
                                ? "text-emerald-300"
                                : "text-amber-300"
                        }
                    >
                        {trend.label}
                    </span>
                )}
                {detail && <span className="text-ui-muted">{detail}</span>}
            </div>
        </div>
    );
}
