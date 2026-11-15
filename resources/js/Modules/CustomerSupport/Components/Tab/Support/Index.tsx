import { ask } from '@/actions/App/Modules/CustomerSupport/Controllers/CustomerSupportController';
import { Form, Input } from '@/Modules/Base/Components/Form';
import Button from '@/Modules/Base/Components/UI/Buttons/Button';
import { useHttp } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import Product, { type SupportProduct } from './Product';
import Order, { type SupportOrder } from './Order';

type QuestionValues = {
    question: string;
};

export default function Support() {
    const request = useHttp<
        QuestionValues,
        {
            message: string;
            blocks: (
                | { type: 'products'; data: SupportProduct[] }
                | { type: 'order'; data: SupportOrder }
            )[];
        }
    >({
        question: '',
    });
    const methods = useForm<QuestionValues>({
        defaultValues: { question: '' },
    });

    const submit = async (data: QuestionValues) => {
        request.transform(() => data);
        await request.post(ask.url()).catch(() => {});
    };

    return (
        <div className="h-full min-h-0 min-w-0 overflow-x-hidden overflow-y-auto overscroll-contain pr-2">
            <Form
                methods={methods}
                onSubmit={submit}
                isPending={request.processing}
                className="space-y-4"
            >
                <Input<QuestionValues>
                    dir="rtl"
                    name="question"
                    label="سؤال"
                    placeholder="سؤالت را بنویس"
                    maxLength={1000}
                />
                <Button type="submit" loading={request.processing}>
                    ارسال
                </Button>
            </Form>
            {request.response?.message && (
                <>
                    <p dir="auto" className="mt-4 whitespace-pre-wrap">
                        {request.response.message}
                    </p>
                    {request.response?.blocks.map((block, index) => (
                        <div key={index} className="mt-4 grid gap-3">
                            {block.type === 'products' &&
                                block.data.map((product) => (
                                    <Product
                                        key={product.id}
                                        product={product}
                                    />
                                ))}
                            {block.type === 'order' && (
                                <Order order={block.data} />
                            )}
                        </div>
                    ))}
                </>
            )}
        </div>
    );
}
