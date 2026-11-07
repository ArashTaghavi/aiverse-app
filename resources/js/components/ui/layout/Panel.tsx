import type { ReactNode } from "react";

export interface PanelProps {
    title: string;
    description?: string;
    action?: ReactNode;
    children: ReactNode;
    className?: string;
    contentClassName?: string;
}

export default function Panel({
    title,
    description,
    action,
    children,
    className = "",
    contentClassName = "",
}: PanelProps) {
    return (
        <section
            className={`min-w-0 overflow-hidden rounded-2xl border border-ui-border bg-white/[0.025] ${className}`}
        >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ui-border-subtle px-4 py-4 sm:px-5">
                <div>
                    <h2 className="text-sm font-medium text-zinc-100">
                        {title}
                    </h2>
                    {description && (
                        <p className="mt-1 text-xs text-ui-muted">
                            {description}
                        </p>
                    )}
                </div>
                {action}
            </div>
            <div className={contentClassName}>{children}</div>
        </section>
    );
}
