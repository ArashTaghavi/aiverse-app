import type { ReactNode } from 'react';
import {
    FormProvider,
    type FieldValues,
    type SubmitHandler,
    type UseFormReturn,
} from 'react-hook-form';

type FormProps<T extends FieldValues> = {
    methods: UseFormReturn<T>;
    onSubmit: SubmitHandler<T>;
    children: ReactNode;
    className?: string;
    isPending?: boolean;
};

export default function Form<T extends FieldValues>({
    methods,
    onSubmit,
    children,
    className,
    isPending,
}: FormProps<T>) {
    return (
        <FormProvider {...methods}>
            <form
                noValidate
                onSubmit={methods.handleSubmit(onSubmit)}
                aria-busy={isPending ?? methods.formState.isSubmitting}
                className={className}
            >
                {children}
            </form>
        </FormProvider>
    );
}
