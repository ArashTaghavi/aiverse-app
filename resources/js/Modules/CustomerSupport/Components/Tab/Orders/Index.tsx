import { useEffect, useState } from 'react';
import {
    ArrowDownNarrowWide,
    ArrowDownWideNarrow,
    ArrowUpDown,
    Search,
    ClipboardList,
} from 'lucide-react';
import { Button, Pagination } from '@/Modules/Base/Components/UI';
import { router, usePage } from '@inertiajs/react';
import { OrderResponse } from '@/Modules/CustomerSupport/Types/Responses/OrderResponse';
import Order from './Order';
import SearchOrder from './Search';
import { PaginateResponse } from '@/Modules/Base/Types/Responses';
import usePaginate from '@/Modules/Base/Hooks/usePaginate';

type PropsType = {
    orders?: PaginateResponse<OrderResponse[]>;
};

export default function Orders() {
    const {
        props: { orders },
        url,
    } = usePage<PropsType>();
    const [searching, setSearching] = useState(false);
    const requestedSort = new URLSearchParams(url.split('?')[1]).get(
        'order_sort',
    );
    const priceSort =
        requestedSort === 'asc' || requestedSort === 'desc'
            ? requestedSort
            : null;
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
    const [pageNumbers, changePage] = usePaginate({
        meta: pagination,
        only: ['orders'],
        pageParameter: 'orders_page',
        perPageParameter: 'orders_per_page',
    });
    useEffect(() => {
        router.reload({ only: ['orders'] });
    }, []);

    return (
        <div
            aria-busy={searching}
            className="relative flex h-full min-h-0 min-w-0 flex-col gap-4"
        >
            {searching && (
                <div className="absolute inset-0 z-30 grid cursor-wait place-items-center rounded-2xl bg-zinc-950/50 backdrop-blur-sm">
                    <div
                        role="status"
                        className="flex flex-col items-center gap-4 rounded-2xl border border-violet-300/20 bg-zinc-900/90 px-10 py-8 text-violet-100 shadow-[0_12px_48px_rgba(139,92,246,0.15)]"
                    >
                        <div
                            aria-hidden="true"
                            className="relative grid size-16 place-items-center"
                        >
                            <div className="absolute inset-0 rounded-full border-2 border-violet-300/10 border-t-violet-300 border-r-violet-300/50 motion-safe:animate-spin" />
                            <Search
                                size={26}
                                className="text-violet-200 motion-safe:animate-pulse"
                            />
                        </div>
                        <span className="text-sm font-medium">
                            Searching orders...
                        </span>
                    </div>
                </div>
            )}
            <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
                <SearchOrder onProcessingChange={setSearching} />
                {pagination && (
                    <Pagination
                        pagination={pagination}
                        pageNumbers={pageNumbers}
                        changePage={changePage}
                        label="Orders pagination"
                    />
                )}
                <div className="flex shrink-0 items-center gap-2">
                    <Button
                        variant="secondary"
                        size="icon"
                        startIcon={<SortIcon size={17} aria-hidden="true" />}
                        onClick={() =>
                            router.reload({
                                data: {
                                    order_sort:
                                        priceSort === 'asc' ? 'desc' : 'asc',
                                    orders_page: 1,
                                },
                                only: ['orders'],
                            })
                        }
                        aria-label={sortLabel}
                    />
                </div>
            </div>
            {!orders ? (
                <p className="animate-pulse">Loading orders...</p>
            ) : orders.data.length === 0 ? (
                <div
                    role="status"
                    className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 overflow-y-auto rounded-2xl border border-dashed border-white/10 bg-linear-to-br from-white/3 to-violet-400/5 p-6 text-center"
                >
                    <div className="grid size-20 shrink-0 place-items-center rounded-3xl border border-violet-300/15 bg-violet-400/8 text-violet-300 shadow-[0_0_40px_rgba(139,92,246,0.08)]">
                        <ClipboardList
                            size={36}
                            strokeWidth={1.5}
                            aria-hidden="true"
                        />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-base font-medium text-zinc-100">
                            No orders found
                        </h3>
                        <p className="max-w-sm text-sm leading-6 text-ui-secondary">
                            Try a different order number or adjust your search
                            and status filters.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="grid min-h-0 min-w-0 flex-1 auto-rows-max grid-cols-1 gap-4 overflow-x-hidden overflow-y-auto overscroll-contain pr-2">
                    {orders.data.map((order) => (
                        <Order order={order} key={order.id} />
                    ))}
                </div>
            )}
        </div>
    );
}
