import { useId, useState, type InputHTMLAttributes } from 'react';
import type { FieldPath, FieldValues } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';

import Input from './Input';

type PasswordInputProps<T extends FieldValues> = Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'name' | 'type' | 'defaultValue'
> & {
    name: FieldPath<T>;
    label: string;
};

export default function PasswordInput<T extends FieldValues>({
    name,
    label,
    disabled,
    id,
    className = '',
    autoComplete = 'current-password',
    ...props
}: PasswordInputProps<T>) {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="relative">
            <Input<T>
                {...props}
                id={inputId}
                name={name}
                label={label}
                type={showPassword ? 'text' : 'password'}
                autoComplete={autoComplete}
                disabled={disabled}
                className={`pr-12 ${className}`}
            />

            <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                disabled={disabled}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-controls={inputId}
                aria-pressed={showPassword}
                className="absolute top-7 right-1 flex h-12 w-10 items-center justify-center rounded-lg text-ui-subtle transition hover:text-zinc-200 focus-visible:outline-2 focus-visible:outline-violet-400 disabled:opacity-50"
            >
                {showPassword ? (
                    <EyeOff size={18} aria-hidden="true" />
                ) : (
                    <Eye size={18} aria-hidden="true" />
                )}
            </button>
        </div>
    );
}
