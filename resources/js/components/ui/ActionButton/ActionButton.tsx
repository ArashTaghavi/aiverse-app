"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal } from "lucide-react";
import { ActionContext } from "./context";

export interface ActionButtonProps {
    children: ReactNode;
    mode?: "inline" | "dropdown";
    label?: string;
    disabled?: boolean;
    className?: string;
}

export default function ActionButton({
    children,
    mode = "inline",
    label = "Actions",
    disabled = false,
    className = "",
}: ActionButtonProps) {
    const id = useId();
    const trigger = useRef<HTMLButtonElement>(null);
    const panel = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
    const open = mode === "dropdown" && position !== null && !disabled;

    function close() {
        setPosition(null);
        trigger.current?.focus();
    }

    useEffect(() => {
        if (!open) return;
        panel.current?.querySelector<HTMLButtonElement>("button:not(:disabled)")?.focus();
        function outside(event: PointerEvent) {
            if (panel.current?.querySelector("dialog[open]")) return;
            if (
                !panel.current?.contains(event.target as Node) &&
                !trigger.current?.contains(event.target as Node)
            )
                setPosition(null);
        }
        function dismiss() {
            if (panel.current?.querySelector("dialog[open]")) return;
            setPosition(null);
        }
        document.addEventListener("pointerdown", outside);
        window.addEventListener("resize", dismiss);
        window.addEventListener("scroll", dismiss, true);
        return () => {
            document.removeEventListener("pointerdown", outside);
            window.removeEventListener("resize", dismiss);
            window.removeEventListener("scroll", dismiss, true);
        };
    }, [open]);

    if (mode === "inline")
        return <div className={`inline-flex items-center gap-1.5 ${className}`}>{children}</div>;

    return (
        <>
            <button
                ref={trigger}
                type="button"
                disabled={disabled}
                aria-label={label}
                title={label}
                aria-haspopup="menu"
                aria-expanded={open}
                aria-controls={open ? id : undefined}
                className={`inline-flex size-7 cursor-pointer items-center justify-center rounded border-0 bg-transparent p-0 text-ui-soft hover:text-white focus-visible:outline-2 focus-visible:outline-violet-400 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
                onClick={() => {
                    if (open) {
                        close();
                        return;
                    }
                    const rect = trigger.current!.getBoundingClientRect();
                    setPosition({
                        top: rect.bottom + 6,
                        left: Math.max(8, Math.min(rect.right - 64, window.innerWidth - 72)),
                    });
                }}
                onKeyDown={(event) => {
                    if (event.key === "ArrowDown") {
                        event.preventDefault();
                        event.currentTarget.click();
                    }
                }}
            >
                <MoreHorizontal size={16} aria-hidden="true" />
            </button>
            {open &&
                createPortal(
                    <ActionContext.Provider value={{ menu: true, close }}>
                        <div
                            ref={panel}
                            id={id}
                            role="menu"
                            aria-label={label}
                            className="fixed z-50 flex max-h-[50vh] w-16 flex-col items-center gap-1 overflow-y-auto rounded-xl border border-ui-border-strong bg-zinc-950/95 p-1.5 shadow-xl backdrop-blur-xl"
                            style={
                                position.top < window.innerHeight / 2
                                    ? position
                                    : {
                                          left: position.left,
                                          bottom: window.innerHeight - position.top + 40,
                                      }
                            }
                            onKeyDown={(event) => {
                                if (event.key === "Escape") {
                                    event.preventDefault();
                                    close();
                                }
                                if (event.key === "Tab") setPosition(null);
                                if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
                                    event.preventDefault();
                                    const buttons = Array.from(
                                        panel.current?.querySelectorAll<HTMLButtonElement>(
                                            "button:not(:disabled)",
                                        ) ?? [],
                                    );
                                    const current = buttons.indexOf(
                                        document.activeElement as HTMLButtonElement,
                                    );
                                    const next =
                                        event.key === "Home"
                                            ? 0
                                            : event.key === "End"
                                              ? buttons.length - 1
                                              : (current +
                                                    (event.key === "ArrowDown" ? 1 : -1) +
                                                    buttons.length) %
                                                buttons.length;
                                    buttons[next]?.focus();
                                }
                            }}
                        >
                            {children}
                        </div>
                    </ActionContext.Provider>,
                    document.body,
                )}
        </>
    );
}
