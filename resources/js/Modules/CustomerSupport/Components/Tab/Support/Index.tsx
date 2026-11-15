import { ask } from '@/actions/App/Modules/CustomerSupport/Controllers/CustomerSupportController';
import { Form, Input } from '@/Modules/Base/Components/Form';
import Button from '@/Modules/Base/Components/UI/Buttons/Button';
import { useHttp } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import Product, { type SupportProduct } from './Product';
import Order, { type SupportOrder } from './Order';

type QuestionValues = {
    question: string;
};

type SupportRequest = {
    question?: string;
    thread_id?: string;
    confirmation?: { interrupt_id: string; confirmed: boolean };
};

type SupportResponse = {
    thread_id: string;
    status: 'completed' | 'confirmation_required';
    message: string;
    blocks: (
        | { type: 'products'; data: SupportProduct[] }
        | { type: 'order'; data: SupportOrder }
    )[];
    interrupts?: {
        interrupt_id: string;
        data: {
            type: string;
            message: string;
            order_number?: string;
            total_amount?: number;
            cancellation_reason?: string | null;
            refund_notice?: string;
        };
    }[];
};

export default function Support() {
    const request = useHttp<SupportRequest, SupportResponse>({
        question: '',
    });
    const [response, setResponse] = useState<SupportResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const submitting = useRef(false);
    const pending = response?.status === 'confirmation_required';
    const methods = useForm<QuestionValues>({
        defaultValues: { question: '' },
    });

    const send = async (data: SupportRequest) => {
        if (submitting.current) return;
        submitting.current = true;
        setError(null);
        request.transform(() => data);
        try {
            setResponse(await request.post(ask.url()));
        } catch {
            setError('ارسال درخواست انجام نشد. لطفاً دوباره تلاش کنید.');
        } finally {
            submitting.current = false;
        }
    };

    const submit = async (data: QuestionValues) => {
        if (pending) return;
        await send({ ...data, thread_id: response?.thread_id });
    };

    const confirm = async (interruptId: string, confirmed: boolean) => {
        if (!response?.thread_id) return;
        await send({
            thread_id: response.thread_id,
            confirmation: { interrupt_id: interruptId, confirmed },
        });
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
                    disabled={request.processing || pending}
                />
                <Button
                    type="submit"
                    loading={request.processing}
                    disabled={pending}
                >
                    ارسال
                </Button>
            </Form>
            {error && (
                <p role="alert" dir="rtl" className="mt-4 text-sm text-red-300">
                    {error}
                </p>
            )}
            {response?.message && (
                <>
                    <p dir="auto" className="mt-4 whitespace-pre-wrap">
                        {response.message}
                    </p>
                    {response.blocks.map((block, index) => (
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
            {pending && (
                <div dir="rtl" className="mt-4 space-y-3" aria-live="polite">
                    <p className="text-sm text-ui-secondary">
                        برای ادامه، درخواست‌های زیر را تأیید یا رد کنید.
                    </p>
                    {response.interrupts?.map((item) => (
                        <section
                            key={item.interrupt_id}
                            aria-label="تأیید لغو سفارش"
                            className="space-y-3 rounded-xl border border-ui-border p-4"
                        >
                            <p>{item.data.message}</p>
                            {item.data.total_amount !== undefined && (
                                <p className="text-sm">
                                    مبلغ سفارش:{' '}
                                    {item.data.total_amount.toLocaleString(
                                        'fa-IR',
                                    )}
                                </p>
                            )}
                            {item.data.cancellation_reason && (
                                <p className="text-sm">
                                    دلیل لغو: {item.data.cancellation_reason}
                                </p>
                            )}
                            {item.data.refund_notice && (
                                <p className="text-sm text-ui-secondary">
                                    {item.data.refund_notice}
                                </p>
                            )}
                            {item.data.type ===
                            'order_cancellation_confirmation' ? (
                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        variant="danger"
                                        disabled={request.processing}
                                        onClick={() =>
                                            void confirm(
                                                item.interrupt_id,
                                                true,
                                            )
                                        }
                                    >
                                        تأیید لغو سفارش
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        disabled={request.processing}
                                        onClick={() =>
                                            void confirm(
                                                item.interrupt_id,
                                                false,
                                            )
                                        }
                                    >
                                        انصراف
                                    </Button>
                                </div>
                            ) : (
                                <p role="alert">
                                    این نوع درخواست تأیید پشتیبانی نمی‌شود.
                                </p>
                            )}
                        </section>
                    ))}
                </div>
            )}
        </div>
    );
}
