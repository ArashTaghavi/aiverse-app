"use client";

import { Eye, Pencil, Trash2 } from "lucide-react";
import { useContext, useRef, useState, type MouseEvent } from "react";
import Confirm from "../Confirm";
import { ActionContext } from "./context";
import Action, { type ActionProps } from "./Action";

export type PresetActionProps = Omit<ActionProps, "icon" | "label" | "tone"> & { label?: string };

export function EditAction({ label = "Edit", ...props }: PresetActionProps) {
    return <Action {...props} icon={<Pencil />} label={label} tone="edit" />;
}

export interface DeleteActionProps extends PresetActionProps {
    message?: string;
    onConfirm?: () => void | Promise<unknown>;
}

export function DeleteAction({
    label = "Delete",
    message,
    onConfirm,
    onClick,
    ...props
}: DeleteActionProps) {
    const [open, setOpen] = useState(false);
    const click = useRef<MouseEvent<HTMLButtonElement> | null>(null);
    const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);
    const { close } = useContext(ActionContext);
    function cancel() {
        setOpen(false);
        close();
    }
    return (
        <>
            <Action
                {...props}
                icon={<Trash2 />}
                label={label}
                tone="delete"
                onClick={(event) => {
                    event.preventDefault();
                    click.current = event;
                    setAnchor(event.currentTarget);
                    setOpen(true);
                }}
            />
            {open && (
                <Confirm
                    open
                    anchor={anchor}
                    message={message}
                    onCancel={cancel}
                    onConfirm={async () => {
                        if (onConfirm) await onConfirm();
                        else if (click.current) onClick?.(click.current);
                    }}
                />
            )}
        </>
    );
}

export function ViewAction({ label = "View", ...props }: PresetActionProps) {
    return <Action {...props} icon={<Eye />} label={label} tone="view" />;
}
