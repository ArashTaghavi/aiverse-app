"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, X } from "lucide-react";
import Button from "./Button";

export interface ConfirmProps {
    open: boolean;
    message?: string;
    anchor?: HTMLElement | null;
    onConfirm: () => void | Promise<unknown>;
    onCancel: () => void;
}

export default function Confirm({
    open,
    message = "Are you sure?",
    anchor,
    onConfirm,
    onCancel,
}: ConfirmProps) {
    const dialog = useRef<HTMLDialogElement>(null);
    const busy = useRef(false);
    const [pending, setPending] = useState(false);
    const [error, setError] = useState("");
    const id = useId();

    useEffect(() => {
        const element = dialog.current;
        if (open && !element?.open) element?.showModal();
        if (!open && element?.open) element.close();
        if (!open || !element) return;
        function position() {
            if (!element) return;
            const rect = anchor?.getBoundingClientRect();
            const width = element.offsetWidth;
            const height = element.offsetHeight;
            const left =
                (rect ? rect.left + rect.width / 2 : window.innerWidth / 2) -
                width / 2;
            const above = rect
                ? rect.top - height - 8
                : (window.innerHeight - height) / 2;
            const top = above >= 8 ? above : (rect?.bottom ?? 8) + 8;
            element.style.left = `${Math.max(8, Math.min(left, window.innerWidth - width - 8))}px`;
            element.style.top = `${Math.max(8, Math.min(top, window.innerHeight - height - 8))}px`;
        }
        position();
        window.addEventListener("resize", position);
        window.addEventListener("scroll", position, true);
        return () => {
            window.removeEventListener("resize", position);
            window.removeEventListener("scroll", position, true);
        };
    }, [open, anchor, error]);

    async function confirm() {
        if (busy.current) return;
        busy.current = true;
        setPending(true);
        setError("");
        try {
            await onConfirm();
            onCancel();
        } catch (cause) {
            setError(
                cause instanceof Error
                    ? cause.message
                    : "Something went wrong. Please try again.",
            );
        } finally {
            busy.current = false;
            setPending(false);
        }
    }

    return (
        <dialog
            ref={dialog}
            aria-labelledby={id}
            aria-describedby={error ? `${id}-error` : undefined}
            aria-busy={pending}
            className="fixed inset-auto m-0 w-56 max-w-[calc(100vw-1rem)] rounded-xl border border-ui-border-strong bg-zinc-950/95 p-3 text-zinc-100 shadow-xl backdrop:bg-transparent"
            onClick={(event) => {
                if (event.target !== event.currentTarget || busy.current)
                    return;
                const rect = event.currentTarget.getBoundingClientRect();
                if (
                    event.clientX < rect.left ||
                    event.clientX > rect.right ||
                    event.clientY < rect.top ||
                    event.clientY > rect.bottom
                )
                    onCancel();
            }}
            onKeyDown={(event) => event.stopPropagation()}
            onCancel={(event) => {
                event.preventDefault();
                if (!busy.current) onCancel();
            }}
            onClose={() => {
                if (open && !busy.current) onCancel();
            }}
        >
            <div>
                <h2 id={id} className="text-xs leading-5 font-medium">
                    {message}
                </h2>
            </div>
            {error && (
                <p
                    id={`${id}-error`}
                    role="alert"
                    className="mt-2 text-xs text-red-300"
                >
                    {error}
                </p>
            )}
            <div className="mt-2 flex justify-end gap-1.5">
                <Button
                    autoFocus
                    variant="secondary"
                    size="icon"
                    aria-label="Cancel"
                    title="Cancel"
                    disabled={pending}
                    onClick={onCancel}
                    startIcon={<X size={15} aria-hidden="true" />}
                />
                <Button
                    variant="danger"
                    size="icon"
                    aria-label="Confirm delete"
                    title="Confirm delete"
                    loading={pending}
                    onClick={() => void confirm()}
                    startIcon={<Check size={15} aria-hidden="true" />}
                />
            </div>
        </dialog>
    );
}
