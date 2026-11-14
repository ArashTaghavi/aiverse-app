import { useEffect, useState } from 'react';
import {
    ArrowDownNarrowWide,
    ArrowDownWideNarrow,
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Search,
    ClipboardList,
} from 'lucide-react';
import Button from '@/Modules/Base/Components/UI/Buttons/Button';
import { router, usePage } from '@inertiajs/react';
import { OrderResponse } from '@/Modules/CustomerSupport/Types/Responses/OrderResponse';
import Order from './Order';
import SearchOrder from './Search';

type PropsType = {
    orders?: {
        data: OrderResponse[];
        meta: {
            current_page: number;
            last_page: number;
            per_page: number;
            from: number | null;
            to: number | null;
            total: number;
        };
    };
};

export default function Orders() {
    const { props: { orders }, url } = usePage<PropsType>();
    const [searching, setSearching] = useState(false);
    const requestedSort = new URLSearchParams(url.split('?')[1]).get('order_sort');
    const priceSort = requestedSort === 'asc' || requestedSort === 'desc' ? requestedSort : null;
    const SortIcon =
        priceSort === 'asc'
            ? ArrowDownNarrowWide
            : priceSort === 'desc'
              ? ArrowDownWideNarrow
              : ArrowUpDown;
    const sortLabel =
        priceSort === 'asc'
            ? 'Price: lowest first. Switch to highest first'
            : 'Sort by price: lowest first';
    const pagination = orders?.meta;
    const pageNumbers = pagination
        ? Array.from({ length: Math.min(5, pagination.last_page) }, (_, index) =>
            Math.max(1, Math.min(pagination.current_page - 2, pagination.last_page - 4)) + index)
        : [];
    const changePage = (page: number, perPage?: number) => router.reload({
        data: { orders_page: page, ...(perPage ? { orders_per_page: perPage } : {}) },
        only: ['orders'],
    });
    useEffect(() => {
        router.reload({ only: ['orders'] });
    }, []);

    return (
        <div aria-busy={searching} className="relative flex h-full min-h-0 min-w-0 flex-col gap-4">
            {searching && (
                <div className="absolute inset-0 z-30 grid cursor-wait place-items-center rounded-2xl bg-zinc-950/50 backdrop-blur-sm">
                    <div role="status" className="flex flex-col items-center gap-4 rounded-2xl border border-violet-300/20 bg-zinc-900/90 px-10 py-8 text-violet-100 shadow-[0_12px_48px_rgba(139,92,246,0.15)]">
                        <div aria-hidden="true" className="relative grid size-16 place-items-center">
                            <div className="absolute inset-0 rounded-full border-2 border-violet-300/10 border-t-violet-300 border-r-violet-300/50 motion-safe:animate-spin" />
                            <Search size={26} className="text-violet-200 motion-safe:animate-pulse" />
                        </div>
                        <span className="text-sm font-medium">Searching orders...</span>
                    </div>
                </div>
            )}
            <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
                <SearchOrder onProcessingChange={setSearching} />
                {pagination && (
                    <div className="flex min-w-0 flex-1 flex-wrap items-center justify-center gap-3 text-xs text-ui-secondary">
                        <label className="flex items-center gap-2">
                            Items per page
                            <select
                                value={pagination.per_page}
                                onChange={(event) => changePage(1, Number(event.target.value))}
                                className="rounded-lg border border-white/10 bg-zinc-900 px-2 py-2 text-zinc-100 outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
                            >
                                {[10, 20, 50, 100].map((size) => <option key={size} value={size}>{size}</option>)}
                            </select>
                        </label>
                        <span className="tabular-nums">{pagination.from ?? 0}–{pagination.to ?? 0} of {pagination.total}</span>
                        <nav aria-label="Orders pagination" className="flex max-w-full flex-wrap items-center gap-1">
                            <Button variant="secondary" size="icon" aria-label="First page" disabled={pagination.current_page === 1} onClick={() => changePage(1)} startIcon={<ChevronsLeft size={16} aria-hidden="true" />} />
                            <Button variant="secondary" size="icon" aria-label="Previous page" disabled={pagination.current_page === 1} onClick={() => changePage(pagination.current_page - 1)} startIcon={<ChevronLeft size={16} aria-hidden="true" />} />
                            {pageNumbers.map((page) => (
                                <Button key={page} variant={page === pagination.current_page ? 'primary' : 'secondary'} size="icon" aria-label={`Page ${page}`} aria-current={page === pagination.current_page ? 'page' : undefined} onClick={() => changePage(page)}>
                                    {page}
                                </Button>
                            ))}
                            <Button variant="secondary" size="icon" aria-label="Next page" disabled={pagination.current_page >= pagination.last_page} onClick={() => changePage(pagination.current_page + 1)} startIcon={<ChevronRight size={16} aria-hidden="true" />} />
                            <Button variant="secondary" size="icon" aria-label="Last page" disabled={pagination.current_page >= pagination.last_page} onClick={() => changePage(pagination.last_page)} startIcon={<ChevronsRight size={16} aria-hidden="true" />} />
                        </nav>
                    </div>
                )}
                <div className="flex shrink-0 items-center gap-2">
                    <Button
                        variant="secondary"
                        size="icon"
                        startIcon={<SortIcon size={17} aria-hidden="true" />}
                        onClick={() => router.reload({
                            data: { order_sort: priceSort === 'asc' ? 'desc' : 'asc', orders_page: 1 },
                            only: ['orders'],
                        })}
                        aria-label={sortLabel}
                    />
                </div>
            </div>
            {!orders ? (
                <p className="animate-pulse">Loading orders...</p>
            ) : orders.data.length === 0 ? (
                <div role="status" className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 overflow-y-auto rounded-2xl border border-dashed border-white/10 bg-linear-to-br from-white/3 to-violet-400/5 p-6 text-center">
                    <div className="grid size-20 shrink-0 place-items-center rounded-3xl border border-violet-300/15 bg-violet-400/8 text-violet-300 shadow-[0_0_40px_rgba(139,92,246,0.08)]">
                        <ClipboardList size={36} strokeWidth={1.5} aria-hidden="true" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-base font-medium text-zinc-100">No orders found</h3>
                        <p className="max-w-sm text-sm leading-6 text-ui-secondary">
                            Try a different order number or adjust your search and status filters.
                        </p>
                    </div>
                </div>
            ) : (
                <div
                    className="grid min-h-0 min-w-0 flex-1 auto-rows-max grid-cols-1 gap-4 overflow-x-hidden overflow-y-auto overscroll-contain pr-2"
                >
                    {orders.data.map((order) => (
                        <Order
                            order={order}
                            key={order.id}
                        />
                    ))}
                </div>
            )}

        </div>
    );
}
