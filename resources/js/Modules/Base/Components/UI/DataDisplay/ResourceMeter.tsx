import type { ReactNode } from "react";

export interface ResourceMeterProps {
    label: string;
    value: number;
    detail?: string;
    icon?: ReactNode;
}

export default function ResourceMeter({
    label,
    value,
    detail,
    icon,
}: ResourceMeterProps) {
    const percent = Math.max(
        0,
        Math.min(100, Number.isFinite(value) ? value : 0),
    );
    const color =
        percent >= 90
            ? "bg-red-400"
            : percent >= 75
              ? "bg-amber-400"
              : "bg-violet-400";
    return (
        <div>
            <div className="mb-2.5 flex items-center justify-between gap-3 text-xs">
                <span className="flex items-center gap-2 text-ui-soft">
                    <span
                        aria-hidden="true"
                        className="text-ui-muted [&>svg]:size-3.5"
                    >
                        {icon}
                    </span>
                    {label}
                </span>
                <span className="font-mono text-ui-soft">{percent}%</span>
            </div>
            <div
                role="progressbar"
                aria-label={label}
                aria-valuenow={percent}
                aria-valuemin={0}
                aria-valuemax={100}
                className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]"
            >
                <div
                    style={{ width: `${percent}%` }}
                    className={`h-full rounded-full ${color}`}
                />
            </div>
            {detail && (
                <p className="mt-2 text-[11px] text-ui-muted">{detail}</p>
            )}
        </div>
    );
}
