import { CreditCard, MapPin, Package, ReceiptText, Truck } from 'lucide-react';

type OrderItem = {
    id: number;
    order_id: number;
    product_id: number;
    quantity: number;
    unit_price: number;
    total_price: number;
};

type Payment = {
    id: number;
    order_id: number;
    amount: number;
    status: string;
    method: string;
    transaction_id: string | null;
    reference_id: string | null;
    paid_at: string | null;
    refunded_at: string | null;
    failure_reason: string | null;
    created_at: string | null;
    updated_at: string | null;
};

export type SupportOrder = {
    id: number;
    user_id: number;
    order_number: string;
    tracking_code: string | null;
    order_status: string;
    payment_status: string;
    total_amount: number;
    shipping_address: string;
    paid_at: string | null;
    shipped_at: string | null;
    delivered_at: string | null;
    cancelled_at: string | null;
    cancellation_reason: string | null;
    created_at: string | null;
    updated_at: string | null;
    items: OrderItem[];
    payments: Payment[];
};

const labels: Record<string, string> = {
    PENDING: 'در انتظار بررسی',
    PROCESSING: 'در حال آماده‌سازی',
    SHIPPED: 'ارسال‌شده',
    DELIVERED: 'تحویل‌شده',
    CANCELLED: 'لغوشده',
    UNPAID: 'پرداخت‌نشده',
    PAID: 'پرداخت‌شده',
    FAILED: 'ناموفق',
    REFUNDED: 'بازپرداخت‌شده',
    ONLINE: 'آنلاین',
    WALLET: 'کیف پول',
    CARD_TO_CARD: 'کارت به کارت',
    CASH_ON_DELIVERY: 'پرداخت در محل',
    BANK_TRANSFER: 'انتقال بانکی',
};
const colors: Record<string, string> = {
    PENDING: 'border-amber-400/20 bg-amber-400/10 text-amber-300',
    PROCESSING: 'border-violet-400/20 bg-violet-400/10 text-violet-300',
    SHIPPED: 'border-sky-400/20 bg-sky-400/10 text-sky-300',
    DELIVERED: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
    PAID: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
    CANCELLED: 'border-rose-400/20 bg-rose-400/10 text-rose-300',
    FAILED: 'border-rose-400/20 bg-rose-400/10 text-rose-300',
    REFUNDED: 'border-sky-400/20 bg-sky-400/10 text-sky-300',
};
const number = (value: number) => value.toLocaleString('fa-IR');
const date = (value: string) => {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime())
        ? value
        : parsed.toLocaleString('fa-IR', {
              dateStyle: 'medium',
              timeStyle: 'short',
          });
};

function Status({ value }: { value: string }) {
    const key = value.toUpperCase();
    return (
        <span
            className={`inline-flex rounded-lg border px-2.5 py-1 text-xs ${colors[key] ?? 'border-white/10 bg-white/5 text-ui-secondary'}`}
        >
            {labels[key] ?? value}
        </span>
    );
}

export default function Order({ order }: { order: SupportOrder }) {
    const dates = [
        ['ثبت سفارش', order.created_at],
        ['پرداخت', order.paid_at],
        ['ارسال', order.shipped_at],
        ['تحویل', order.delivered_at],
        ['لغو', order.cancelled_at],
        ['آخرین به‌روزرسانی', order.updated_at],
    ].filter((entry): entry is [string, string] => Boolean(entry[1]));

    return (
        <article
            dir="rtl"
            className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-linear-to-br from-white/5 to-violet-400/5 text-sm"
        >
            <header className="flex flex-wrap items-start justify-between gap-4 border-b border-white/8 p-5">
                <div className="flex min-w-0 items-center gap-3">
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-violet-400/10 text-violet-300">
                        <ReceiptText size={21} />
                    </span>
                    <div className="min-w-0 space-y-1">
                        <p className="text-xs text-ui-muted">جزئیات سفارش</p>
                        <h3
                            dir="auto"
                            className="font-semibold break-all text-zinc-100"
                        >
                            {order.order_number}
                        </h3>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Status value={order.order_status} />
                    <Status value={order.payment_status} />
                </div>
            </header>

            <div className="space-y-6 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-violet-400/15 bg-violet-400/5 p-4">
                    <span className="text-ui-secondary">مبلغ کل سفارش</span>
                    <strong className="text-xl text-violet-200 tabular-nums">
                        {number(order.total_amount)}
                    </strong>
                </div>

                <section className="space-y-3">
                    <h4 className="flex items-center gap-2 font-medium text-zinc-200">
                        <Truck size={16} className="text-violet-300" />
                        اطلاعات ارسال
                    </h4>
                    {order.tracking_code && (
                        <p className="flex flex-wrap gap-2 text-ui-secondary">
                            کد رهگیری:{' '}
                            <span
                                dir="ltr"
                                className="font-mono break-all text-zinc-100 select-all"
                            >
                                {order.tracking_code}
                            </span>
                        </p>
                    )}
                    <p className="flex items-start gap-2 leading-7 text-ui-secondary">
                        <MapPin
                            size={15}
                            className="mt-1.5 shrink-0 text-ui-muted"
                        />
                        <span className="break-words whitespace-pre-wrap">
                            {order.shipping_address}
                        </span>
                    </p>
                    {dates.length > 0 && (
                        <dl className="grid gap-3 rounded-xl bg-black/15 p-3 sm:grid-cols-2">
                            {dates.map(([label, value]) => (
                                <div key={label} className="space-y-1">
                                    <dt className="text-xs text-ui-muted">
                                        {label}
                                    </dt>
                                    <dd className="text-xs leading-6 text-ui-secondary">
                                        {date(value)}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    )}
                    {order.cancellation_reason && (
                        <p className="rounded-xl border border-rose-400/15 bg-rose-400/5 p-3 leading-7 text-rose-200">
                            علت لغو: {order.cancellation_reason}
                        </p>
                    )}
                </section>

                <section className="space-y-3">
                    <h4 className="flex items-center gap-2 font-medium text-zinc-200">
                        <Package size={16} className="text-violet-300" />
                        اقلام سفارش{' '}
                        <span className="text-xs text-ui-muted">
                            ({number(order.items.length)} ردیف)
                        </span>
                    </h4>
                    {order.items.length ? (
                        <div className="overflow-x-auto rounded-xl border border-white/8">
                            <table className="w-full text-right text-xs">
                                <thead className="bg-white/5 text-ui-muted">
                                    <tr>
                                        {[
                                            'شناسه کالا',
                                            'تعداد',
                                            'قیمت واحد',
                                            'مبلغ کل',
                                        ].map((label) => (
                                            <th
                                                key={label}
                                                className="px-4 py-3 font-medium whitespace-nowrap"
                                            >
                                                {label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {order.items.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="text-ui-secondary"
                                        >
                                            <td className="px-4 py-3 text-zinc-200">
                                                #{number(item.product_id)}
                                            </td>
                                            <td className="px-4 py-3">
                                                {number(item.quantity)}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                                                {number(item.unit_price)}
                                            </td>
                                            <td className="px-4 py-3 font-medium whitespace-nowrap text-violet-200 tabular-nums">
                                                {number(item.total_price)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-xs text-ui-muted">
                            قلمی برای این سفارش ثبت نشده است.
                        </p>
                    )}
                </section>

                <section className="space-y-3">
                    <h4 className="flex items-center gap-2 font-medium text-zinc-200">
                        <CreditCard size={16} className="text-violet-300" />
                        پرداخت‌ها
                    </h4>
                    {order.payments.length ? (
                        <div className="grid gap-3">
                            {order.payments.map((payment) => (
                                <div
                                    key={payment.id}
                                    className="space-y-3 rounded-xl border border-white/8 bg-black/10 p-4"
                                >
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-semibold text-zinc-100 tabular-nums">
                                                {number(payment.amount)}
                                            </span>
                                            <span className="text-xs text-ui-muted">
                                                ·{' '}
                                                {labels[
                                                    payment.method.toUpperCase()
                                                ] ?? payment.method}
                                            </span>
                                        </div>
                                        <Status value={payment.status} />
                                    </div>
                                    <dl className="grid gap-3 text-xs sm:grid-cols-2">
                                        {payment.transaction_id && (
                                            <div className="space-y-1">
                                                <dt className="text-ui-muted">
                                                    شناسه تراکنش
                                                </dt>
                                                <dd
                                                    dir="ltr"
                                                    className="text-right font-mono break-all text-ui-secondary select-all"
                                                >
                                                    {payment.transaction_id}
                                                </dd>
                                            </div>
                                        )}
                                        {payment.reference_id && (
                                            <div className="space-y-1">
                                                <dt className="text-ui-muted">
                                                    شماره مرجع
                                                </dt>
                                                <dd
                                                    dir="ltr"
                                                    className="text-right font-mono break-all text-ui-secondary select-all"
                                                >
                                                    {payment.reference_id}
                                                </dd>
                                            </div>
                                        )}
                                        {(payment.paid_at ||
                                            payment.created_at) && (
                                            <div className="space-y-1">
                                                <dt className="text-ui-muted">
                                                    {payment.paid_at
                                                        ? 'زمان پرداخت'
                                                        : 'زمان ثبت'}
                                                </dt>
                                                <dd className="text-ui-secondary">
                                                    {date(
                                                        (payment.paid_at ??
                                                            payment.created_at)!,
                                                    )}
                                                </dd>
                                            </div>
                                        )}
                                        {payment.refunded_at && (
                                            <div className="space-y-1">
                                                <dt className="text-ui-muted">
                                                    زمان بازپرداخت
                                                </dt>
                                                <dd className="text-sky-200">
                                                    {date(payment.refunded_at)}
                                                </dd>
                                            </div>
                                        )}
                                    </dl>
                                    {payment.failure_reason && (
                                        <p className="rounded-lg bg-rose-400/5 p-2 text-xs leading-6 text-rose-200">
                                            علت ناموفق بودن:{' '}
                                            {payment.failure_reason}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="rounded-xl border border-dashed border-white/10 p-4 text-xs text-ui-muted">
                            پرداختی برای این سفارش ثبت نشده است.
                        </p>
                    )}
                </section>
            </div>
        </article>
    );
}
