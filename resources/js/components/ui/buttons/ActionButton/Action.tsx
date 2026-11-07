"use client";

import { useContext, type ButtonHTMLAttributes, type ReactNode } from "react";
import { LoaderCircle } from "lucide-react";
import { ActionContext } from "./context";

export interface ActionProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
    icon: ReactNode;
    label: string;
    tooltip?: string;
    loading?: boolean;
    tone?: "neutral" | "edit" | "delete" | "view";
}

const tones = {
    neutral: "text-ui-soft hover:text-white",
    edit: "text-amber-400 hover:text-amber-200",
    delete: "text-red-400 hover:text-red-200",
    view: "text-sky-400 hover:text-sky-200",
};

export default function Action({
    icon,
    label,
    tooltip,
    loading = false,
    disabled,
    tone = "neutral",
    className = "",
    onClick,
    type = "button",
    ...props
}: ActionProps) {
    const { menu, close } = useContext(ActionContext);
    return (
        <button
            {...props}
            type={type}
            role={menu ? "menuitem" : props.role}
            disabled={disabled || loading}
            aria-busy={loading}
            aria-label={props["aria-label"] ?? label}
            title={tooltip ?? label}
            className={`inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded border-0 bg-transparent p-0 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400 disabled:cursor-not-allowed disabled:opacity-50 ${tones[tone]} ${className}`}
            onClick={(event) => {
                onClick?.(event);
                if (!event.defaultPrevented) close();
            }}
        >
            <span
                className="pointer-events-none flex size-3.5 shrink-0 items-center justify-center [&>svg]:size-3.5"
                aria-hidden="true"
            >
                {loading ? (
                    <LoaderCircle className="animate-spin motion-reduce:animate-none" />
                ) : (
                    icon
                )}
            </span>
        </button>
    );
}
