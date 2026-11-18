import {
    ask,
    confirmCancelOrder,
} from '@/actions/App/Modules/CustomerSupport/Controllers/CustomerSupportController';
import { Form, Input } from '@/Modules/Base/Components/Form';
import Button from '@/Modules/Base/Components/UI/Buttons/Button';
import { useHttp } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import Product, { type SupportProduct } from './Product';
import Order, { type SupportOrder } from './Order';
import { ConfirmCancelOrder } from './ConfirmAction/Index';

type QuestionValues = { question: string };

type AnswerResponse = {
    type?: never;
    message: string;
    blocks: (
        | { type: 'products'; data: SupportProduct[] }
        | { type: 'order'; data: SupportOrder }
    )[];
};

type CancellationConfirmation = {
    type: 'order_cancellation_confirmation';
    thread_id: string;
    message: string;
};

type SupportResponse = AnswerResponse | CancellationConfirmation;

type ConfirmRequest = {
    thread_id: string;
    confirmed: boolean;
};

export default function Support() {
    const request = useHttp<QuestionValues, SupportResponse>({ question: '' });
    const confirmationRequest = useHttp<ConfirmRequest, SupportResponse>({
        thread_id: '',
        confirmed: false,
    });
    const [response, setResponse] = useState<SupportResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const submitting = useRef(false);
    const pending =
        response?.type === 'order_cancellation_confirmation' ? response : null;
    const processing = request.processing || confirmationRequest.processing;
    const methods = useForm<QuestionValues>({
        defaultValues: { question: '' },
    });

    const submit = async (data: QuestionValues) => {
        if (submitting.current || pending) return;
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

    const confirm = async (confirmed: boolean) => {
        if (submitting.current || !pending) return;
        submitting.current = true;
        setError(null);
        confirmationRequest.transform(() => ({
            thread_id: pending.thread_id,
            confirmed,
        }));
        try {
            setResponse(
                await confirmationRequest.post(confirmCancelOrder.url()),
            );
        } catch {
            setError('ثبت تصمیم لغو سفارش انجام نشد. لطفاً دوباره تلاش کنید.');
        } finally {
            submitting.current = false;
        }
    };

    return (
        <div className="h-full min-h-0 min-w-0 overflow-x-hidden overflow-y-auto overscroll-contain pr-2">
            <Form
                methods={methods}
                onSubmit={submit}
                isPending={processing}
                className="space-y-4"
            >
                <Input<QuestionValues>
                    dir="rtl"
                    name="question"
                    label="سؤال"
                    placeholder="سؤالت را بنویس"
                    maxLength={1000}
                    disabled={processing || !!pending}
                />
                <Button
                    type="submit"
                    loading={request.processing}
                    disabled={processing || !!pending}
                >
                    ارسال
                </Button>
            </Form>
            {error && (
                <p role="alert" dir="rtl" className="mt-4 text-sm text-red-300">
                    {error}
                </p>
            )}
            {pending ? (
                <ConfirmCancelOrder
                    pending={pending}
                    processing={processing}
                    confirming={confirmationRequest.processing}
                    onConfirm={confirm}
                />
            ) : (
                response && (
                    <>
                        <p dir="auto" className="mt-4 whitespace-pre-wrap">
                            {response.message}
                        </p>
                        {'blocks' in response &&
                            response.blocks.map((block, index) => (
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
                )
            )}
        </div>
    );
}
