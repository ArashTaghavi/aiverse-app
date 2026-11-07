"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { LoaderCircle } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "danger" | "outline-danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    size?: "default" | "icon" | "sm";
    loading?: boolean;
    fullWidth?: boolean;
    startIcon?: ReactNode;
    endIcon?: ReactNode;
};

const variants: Record<ButtonVariant, string> = {
    primary:
        "border-violet-300/20 bg-violet-600 text-white hover:bg-violet-500",
    secondary: "border-ui-border bg-white/5 text-zinc-200 hover:bg-white/10",
    danger: "border-red-400/20 bg-red-600 text-white hover:bg-red-500",
    "outline-danger":
        "border-ui-border-muted bg-transparent text-ui-secondary hover:border-red-400/20 hover:bg-red-400/5 hover:text-red-300",
};

const sizes = {
    default: "h-12 gap-2.5 rounded-xl px-5 text-sm font-medium",
    icon: "size-9 shrink-0 gap-2.5 rounded-xl p-0 text-sm font-medium",
    sm: "gap-2 rounded-lg px-3 py-2 text-xs font-normal",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            children,
            type = "button",
            variant = "primary",
            size = "default",
            loading = false,
            disabled = false,
            fullWidth = false,
            startIcon,
            endIcon,
            className = "",
            ...props
        },
        ref,
    ) => {
        return (
            <button
                {...props}
                ref={ref}
                type={type}
                disabled={disabled || loading}
                aria-busy={loading}
                className={[
                    "inline-flex items-center justify-center border transition",
                    sizes[size],
                    "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-400",
                    "cursor-pointer disabled:cursor-not-allowed disabled:opacity-60",
                    variants[variant],
                    fullWidth && "w-full",
                    className,
                ]
                    .filter(Boolean)
                    .join(" ")}
            >
                {loading ? (
                    <LoaderCircle
                        size={18}
                        className="animate-spin motion-reduce:animate-none"
                        aria-hidden="true"
                    />
                ) : (
                    startIcon
                )}

                {children}

                {!loading && endIcon}
            </button>
        );
    },
);

Button.displayName = "Button";

export default Button;
