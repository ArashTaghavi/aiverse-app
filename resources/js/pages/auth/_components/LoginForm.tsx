import { router } from "@inertiajs/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useState } from "react";
import { ArrowRight, UserPlus } from "lucide-react";
import { z } from "zod";

import { Form, Input, PasswordInput } from "@/components/form";
import Button from "@/components/ui/Button";

import { store as login } from "@/actions/Laravel/Fortify/Http/Controllers/AuthenticatedSessionController";
import { store as register } from "@/actions/Laravel/Fortify/Http/Controllers/RegisteredUserController";

const authSchema = z.object({
    username: z.string().trim().min(1, "Enter your username."),
    password: z.string().min(1, "Enter your password."),
});

type AuthValues = z.infer<typeof authSchema>;

export default function LoginForm({
    onAuthenticated,
}: {
    onAuthenticated?: () => Promise<void> | void;
}) {
    const methods = useForm<AuthValues>({
        resolver: zodResolver(authSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    });

    const [processing, setProcessing] = useState(false);

    const handleLogin: SubmitHandler<AuthValues> = (data) => {
        router.post(login().url, data, {
            onSuccess: () => onAuthenticated?.(),
            onStart: () => setProcessing(true),
            onFinish: () => setProcessing(false),
        });
    };

    const handleRegister: SubmitHandler<AuthValues> = (data) => {
        router.post(register().url, data, {
            onSuccess: () => onAuthenticated?.(),
            onStart: () => setProcessing(true),
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <Form methods={methods} onSubmit={handleLogin} className="mt-9 space-y-6">
            <Input<AuthValues>
                name="username"
                label="Username"
                placeholder="Username"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                dir="ltr"
                readOnly={processing}
            />

            <PasswordInput<AuthValues>
                name="password"
                label="Password"
                placeholder="Password"
                autoComplete="current-password"
                readOnly={processing}
                disabled={processing}
            />

            <div className="flex gap-2">
                <Button
                    type="submit"
                    disabled={processing}
                    loading={processing}
                    fullWidth
                    startIcon={<ArrowRight size={17} aria-hidden="true" />}
                >
                    Sign in
                </Button>

                <Button
                    type="button"
                    onClick={() => methods.handleSubmit(handleRegister)()}
                    variant="secondary"
                    disabled={processing}
                    loading={processing}
                    fullWidth
                    startIcon={<UserPlus size={17} aria-hidden="true" />}
                >
                    Sign up
                </Button>
            </div>
        </Form>
    );
}
