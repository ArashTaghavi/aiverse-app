import { useId, type InputHTMLAttributes } from 'react';
import { usePage } from '@inertiajs/react';
import {
    useController,
    useFormContext,
    type FieldPath,
    type FieldValues,
} from 'react-hook-form';
import { FileUp } from 'lucide-react';

type FileInputProps<T extends FieldValues> = Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'name' | 'type' | 'value' | 'defaultValue' | 'onChange' | 'multiple'
> & {
    name: FieldPath<T>;
    label: string;
    hint?: string;
};

export default function FileInput<T extends FieldValues>({
    name,
    label,
    hint,
    id,
    className = '',
    ...props
}: FileInputProps<T>) {
    const { control } = useFormContext<T>();
    const { errors } = usePage().props;
    const {
        field: { name: fieldName, ref, onBlur, onChange },
        fieldState: { error: validationError },
    } = useController({ name, control });
    const error = validationError?.message ?? errors[name];
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
        <div className="space-y-2.5">
            <label
                htmlFor={inputId}
                className="flex items-center gap-2 text-xs font-medium text-ui-soft"
            >
                <FileUp size={16} aria-hidden="true" /> {label}
                {error && (
                    <span
                        id={`${inputId}-error`}
                        role="alert"
                        className="mx-2 text-xs text-red-300"
                    >
                        {error}
                    </span>
                )}
            </label>
            <input
                {...props}
                type="file"
                id={inputId}
                name={fieldName}
                ref={ref}
                onBlur={onBlur}
                onChange={(event) => onChange(event.target.files?.[0] ?? null)}
                aria-invalid={!!error}
                aria-describedby={
                    [
                        hint && `${inputId}-hint`,
                        error && `${inputId}-error`,
                        props['aria-describedby'],
                    ]
                        .filter(Boolean)
                        .join(' ') || undefined
                }
                className={`block w-full rounded-xl border border-dashed bg-[#0b0b10] p-4 text-sm text-ui-soft file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-violet-500/15 file:px-4 file:py-2 file:text-violet-200 hover:file:bg-violet-500/25 focus-visible:outline-2 focus-visible:outline-violet-400 disabled:cursor-not-allowed disabled:opacity-50 ${error ? 'border-red-400/60' : 'border-ui-border-strong'} ${className}`}
            />
            {hint && (
                <p id={`${inputId}-hint`} className="text-xs text-ui-muted">
                    {hint}
                </p>
            )}
        </div>
    );
}
