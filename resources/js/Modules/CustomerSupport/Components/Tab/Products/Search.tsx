import { Search } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Form, Input } from '@/Modules/Base/Components/Form';
import Button from '@/Modules/Base/Components/UI/Buttons/Button';
import { router } from '@inertiajs/react';

type SearchValues = {
    name: string;
};

export default function SearchProduct({
    onProcessingChange,
}: {
    onProcessingChange?: (processing: boolean) => void;
}) {
    const [processing, setProcessing] = useState(false);
    const methods = useForm<SearchValues>({
        defaultValues: { name: '' },
    });

    const searchProducts = (name: string) => {
        if (processing) {
            return;
        }

        router.reload({
            data: { name: name.trim(), page: 1 },
            only: ['products'],
            onStart: () => {
                setProcessing(true);
                onProcessingChange?.(true);
            },
            onFinish: () => {
                setProcessing(false);
                onProcessingChange?.(false);
            },
        });
    };

    return (
        <Form
            methods={methods}
            onSubmit={({ name }) => searchProducts(name)}
            isPending={processing}
            className="min-w-0 flex-1 sm:max-w-md"
        >
            <div className="relative [&_label]:sr-only [&>div]:space-y-0">
                <Input<SearchValues>
                    name="name"
                    label="Product name"
                    type="search"
                    readOnly={processing}
                    onInput={(event) => {
                        if (event.currentTarget.value === '') {
                            methods.reset();
                            searchProducts('');
                        }
                    }}
                    placeholder="Search products by name..."
                    autoComplete="off"
                    className={`pr-12 ${processing ? 'ring-2 ring-violet-400/20' : ''}`}
                />
                <Button
                    type="submit"
                    variant="tab"
                    size="icon"
                    loading={processing}
                    aria-label={
                        processing ? 'Searching products' : 'Search products'
                    }
                    className="absolute top-1.5 right-1.5"
                    startIcon={<Search size={17} />}
                />
                <span role="status" className="sr-only">
                    {processing ? 'Searching products...' : ''}
                </span>
            </div>
        </Form>
    );
}
