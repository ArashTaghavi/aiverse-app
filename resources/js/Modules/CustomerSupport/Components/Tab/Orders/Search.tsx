import { Search } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { router, usePage } from '@inertiajs/react';
import { Form, Input } from '@/Modules/Base/Components/Form';
import Button from '@/Modules/Base/Components/UI/Buttons/Button';

type SearchValues = { name: string; status: string; payment_status: string };

export default function SearchOrder({ onProcessingChange }: { onProcessingChange?: (processing: boolean) => void }) {
    const { url } = usePage();
    const query = new URLSearchParams(url.split('?')[1]);
    const [processing, setProcessing] = useState(false);
    const methods = useForm<SearchValues>({
        defaultValues: {
            name: query.get('order_search') ?? '',
            status: query.get('order_status') ?? '',
            payment_status: query.get('order_payment_status') ?? '',
        },
    });

    const searchOrders = ({ name, status, payment_status }: SearchValues) => {
        if (processing) { return; }
        router.reload({
            data: { order_search: name.trim(), order_status: status, order_payment_status: payment_status, orders_page: 1 },
            only: ['orders'],
            onStart: () => { setProcessing(true); onProcessingChange?.(true); },
            onFinish: () => { setProcessing(false); onProcessingChange?.(false); },
        });
    };
    const selectClass = 'h-12 min-w-0 rounded-xl border border-white/10 bg-zinc-900 px-3 text-xs text-ui-secondary outline-none focus-visible:ring-2 focus-visible:ring-violet-400 disabled:opacity-50';

    return (
        <Form methods={methods} onSubmit={searchOrders} isPending={processing} className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
            <div className="relative min-w-48 flex-1 [&_label]:sr-only [&>div]:space-y-0">
                <Input<SearchValues>
                    name="name" label="Search orders" type="search" placeholder="Order, tracking code or product..."
                    autoComplete="off" readOnly={processing} className="pr-12"
                    onInput={(event) => {
                        if (event.currentTarget.value === '') {
                            methods.resetField('name', { defaultValue: '' });
                            searchOrders({ ...methods.getValues(), name: '' });
                        }
                    }}
                />
                <Button type="submit" variant="tab" size="icon" loading={processing} aria-label="Search orders" className="absolute top-1.5 right-1.5" startIcon={<Search size={17} aria-hidden="true" />} />
            </div>
            <select {...methods.register('status')} aria-label="Order status" disabled={processing} className={selectClass} onChange={(event) => {
                void methods.register('status').onChange(event);
                searchOrders({ ...methods.getValues(), status: event.currentTarget.value });
            }}>
                <option value="">All order statuses</option>
                <option value="PENDING">Pending</option>
                <option value="PROCESSING">Processing</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
            </select>
            <select {...methods.register('payment_status')} aria-label="Payment status" disabled={processing} className={selectClass} onChange={(event) => {
                void methods.register('payment_status').onChange(event);
                searchOrders({ ...methods.getValues(), payment_status: event.currentTarget.value });
            }}>
                <option value="">All payment statuses</option>
                <option value="UNPAID">Unpaid</option>
                <option value="PAID">Paid</option>
                <option value="FAILED">Failed</option>
                <option value="REFUNDED">Refunded</option>
            </select>
        </Form>
    );
}
