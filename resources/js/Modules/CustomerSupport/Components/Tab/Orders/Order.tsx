import { CalendarDays, CreditCard, MapPin, Package, Truck } from 'lucide-react';
import type {
    OrderResponse,
    OrderStatus,
    PaymentStatus,
} from '@/Modules/CustomerSupport/Types/Responses/OrderResponse';

const orderStyles: Record<OrderStatus, string> = {
    PENDING: 'border-amber-400/20 bg-amber-400/10 text-amber-300',
    PROCESSING: 'border-violet-400/20 bg-violet-400/10 text-violet-300',
    SHIPPED: 'border-sky-400/20 bg-sky-400/10 text-sky-300',
    DELIVERED: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
    CANCELLED: 'border-rose-400/20 bg-rose-400/10 text-rose-300',
};
const paymentStyles: Record<PaymentStatus, string> = {
    UNPAID: 'text-amber-300',
    PAID: 'text-emerald-300',
    FAILED: 'text-rose-300',
    REFUNDED: 'text-sky-300',
};
const statusLabel = (status: string) =>
    status.charAt(0) + status.slice(1).toLowerCase();

export default function Order({ order }: { order: OrderResponse }) {
    const quantity = order.items.reduce(
        (total, item) => total + item.quantity,
        0,
    );

    return (
        <article className="relative flex min-h-0 min-w-0 flex-col gap-4 rounded-2xl border border-white/10 bg-linear-to-br from-white/8 via-white/3 to-violet-400/5 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] transition-colors hover:border-violet-300/25">
            <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-medium text-zinc-100">
                        {order.order_number}
                    </h3>
                </div>
                <span
                    className={`rounded-lg border px-2 py-1 text-[10px] font-medium ${orderStyles[order.order_status]}`}
                >
                    {statusLabel(order.order_status)}
                </span>
            </div>
            <div className="min-w-0">
                <div
                    role="region"
                    aria-label={`Items in order ${order.order_number}`}
                    tabIndex={0}
                    className="flex max-w-full min-w-0 gap-3 overflow-x-auto overscroll-x-contain pb-2 focus-visible:outline-2 focus-visible:outline-violet-400"
                >
                    {order.items.map((item) => (
                        <div
                            key={item.id}
                            className="flex w-60 shrink-0 items-center gap-3 rounded-xl border border-white/5 bg-black/10 p-2"
                        >
                            <div className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-lg bg-white p-1.5">
                                {item.image ? (
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        loading="lazy"
                                        className="size-full object-contain"
                                    />
                                ) : (
                                    <Package
                                        size={22}
                                        className="text-zinc-400"
                                        aria-hidden="true"
                                    />
                                )}
                            </div>
                            <div className="min-w-0">
                                <p className="line-clamp-2 text-xs leading-5 text-zinc-200">
                                    {item.title}
                                </p>
                                <p className="text-[10px] text-ui-muted">
                                    {item.quantity} ×{' '}
                                    {item.unit_price.toLocaleString('en-US')}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
                {order.items.length === 0 && (
                    <p className="text-xs text-ui-muted">No items available.</p>
                )}
            </div>
            <div className="flex shrink-0 flex-wrap items-end justify-between gap-3 border-t border-white/8 pt-3">
                <div className="flex min-w-0 flex-col gap-2 text-[11px] text-ui-secondary">
                    <span className="inline-flex items-center gap-1.5">
                        <CalendarDays size={13} aria-hidden="true" />
                        {order.created_at
                            ? new Date(order.created_at).toLocaleDateString(
                                  'en-US',
                              )
                            : 'Date unavailable'}{' '}
                        · {quantity} items
                    </span>
                    <span
                        className={`inline-flex items-center gap-1.5 ${paymentStyles[order.payment_status]}`}
                    >
                        <CreditCard size={13} aria-hidden="true" />
                        {statusLabel(order.payment_status)}
                        {order.payments[0]
                            ? ` · ${order.payments[0].method.toLowerCase().replaceAll('_', ' ')}`
                            : ''}
                    </span>
                    {order.tracking_code && (
                        <span className="inline-flex min-w-0 items-center gap-1.5">
                            <Truck
                                size={13}
                                className="shrink-0"
                                aria-hidden="true"
                            />
                            <span className="truncate">
                                {order.tracking_code}
                            </span>
                        </span>
                    )}
                    <span className="inline-flex items-center gap-1.5">
                        <MapPin
                            size={13}
                            className="shrink-0"
                            aria-hidden="true"
                        />
                        <span dir="auto" className="line-clamp-1">
                            {order.shipping_address}
                        </span>
                    </span>
                    {order.cancellation_reason && (
                        <p dir="auto" className="line-clamp-2 text-rose-300/80">
                            {order.cancellation_reason}
                        </p>
                    )}
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] tracking-widest text-ui-muted uppercase">
                        Order total
                    </span>
                    <span className="text-lg font-semibold text-violet-200 tabular-nums">
                        {order.total_amount.toLocaleString('en-US')}
                    </span>
                </div>
            </div>
        </article>
    );
}
