import { Search } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Form, Input } from '@/Modules/Base/Components/Form';
import Button from '@/Modules/Base/Components/UI/Buttons/Button';
import { router } from '@inertiajs/react';

type SearchValues = {
    name: string;
};

export default function SearchProduct() {
    const methods = useForm<SearchValues>({
        defaultValues: { name: '' },
    });

    return (
        <Form
            methods={methods}
            onSubmit={({ name }) => {
                router.reload({
                    data: { name: name.trim() },
                    only: ['products'],
                });
            }}
            className="min-w-0 flex-1 sm:max-w-md"
        >
            <div className="relative [&_label]:sr-only [&>div]:space-y-0">
                <Input<SearchValues>
                    name="name"
                    label="Product name"
                    type="search"
                    onInput={(event) => {
                        if (event.currentTarget.value === '') {
                            methods.reset();
                            router.reload({
                                data: { name: '' },
                                only: ['products'],
                            });
                        }
                    }}
                    placeholder="Search products by name..."
                    autoComplete="off"
                    className="pr-12"
                />
                <Button
                    type="submit"
                    variant="tab"
                    size="icon"
                    className="absolute top-1.5 right-1.5"
                    startIcon={<Search size={17} />}
                />
            </div>
        </Form>
    );
}
