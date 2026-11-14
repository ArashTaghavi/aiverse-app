import { useEffect, useState } from 'react';
import {
    ArrowDownNarrowWide,
    ArrowDownWideNarrow,
    ArrowUpDown,
    Grid3X3,
    LayoutGrid,
    List,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Search,
    PackageSearch,
} from 'lucide-react';
import Button from '@/Modules/Base/Components/UI/Buttons/Button';
import { router, usePage } from '@inertiajs/react';
import { ProductResponse } from '@/Modules/CustomerSupport/Types/Responses/ProductResponse';
import Product from './Product';
import SearchProduct from './Search';

type PropsType = {
    products?: {
        data: ProductResponse[];
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

const layouts = [
    {
        label: '6 × 2',
        icon: Grid3X3,
        list: false,
        classes:
            'grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 xl:auto-rows-[calc((100%_-_1rem)/2)]',
    },
    {
        label: '3 × 1',
        icon: LayoutGrid,
        list: false,
        classes:
            'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 xl:auto-rows-[100%]',
    },
    { label: 'List', icon: List, list: true, classes: 'grid-cols-1' },
];

export default function Products() {
    const {
        props: { products },
        url,
    } = usePage<PropsType>();
    const [layoutIndex, setLayoutIndex] = useState(0);
    const [searching, setSearching] = useState(false);
    const requestedSort = new URLSearchParams(url.split('?')[1]).get('sort');
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
    const layout = layouts[layoutIndex];
    const LayoutIcon = layout.icon;
    const pagination = products?.meta;
    const pageNumbers = pagination
        ? Array.from(
              { length: Math.min(5, pagination.last_page) },
              (_, index) =>
                  Math.max(
                      1,
                      Math.min(
                          pagination.current_page - 2,
                          pagination.last_page - 4,
                      ),
                  ) + index,
          )
        : [];
    const changePage = (page: number, perPage?: number) =>
        router.reload({
            data: { page, ...(perPage ? { per_page: perPage } : {}) },
            only: ['products'],
        });
    useEffect(() => {
        router.reload({ only: ['products'] });
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
                            Searching products...
                        </span>
                    </div>
                </div>
            )}
            <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
                <SearchProduct onProcessingChange={setSearching} />
                {pagination && (
                    <div className="flex min-w-0 flex-1 flex-wrap items-center justify-center gap-3 text-xs text-ui-secondary">
                        <label className="flex items-center gap-2">
                            Items per page
                            <select
                                value={pagination.per_page}
                                onChange={(event) =>
                                    changePage(1, Number(event.target.value))
                                }
                                className="rounded-lg border border-white/10 bg-zinc-900 px-2 py-2 text-zinc-100 outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
                            >
                                {[10, 20, 50, 100].map((size) => (
                                    <option key={size} value={size}>
                                        {size}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <span className="tabular-nums">
                            {pagination.from ?? 0}–{pagination.to ?? 0} of{' '}
                            {pagination.total}
                        </span>
                        <nav
                            aria-label="Products pagination"
                            className="flex max-w-full flex-wrap items-center gap-1"
                        >
                            <Button
                                variant="secondary"
                                size="icon"
                                aria-label="First page"
                                disabled={pagination.current_page === 1}
                                onClick={() => changePage(1)}
                                startIcon={
                                    <ChevronsLeft
                                        size={16}
                                        aria-hidden="true"
                                    />
                                }
                            />
                            <Button
                                variant="secondary"
                                size="icon"
                                aria-label="Previous page"
                                disabled={pagination.current_page === 1}
                                onClick={() =>
                                    changePage(pagination.current_page - 1)
                                }
                                startIcon={
                                    <ChevronLeft size={16} aria-hidden="true" />
                                }
                            />
                            {pageNumbers.map((page) => (
                                <Button
                                    key={page}
                                    variant={
                                        page === pagination.current_page
                                            ? 'primary'
                                            : 'secondary'
                                    }
                                    size="icon"
                                    aria-label={`Page ${page}`}
                                    aria-current={
                                        page === pagination.current_page
                                            ? 'page'
                                            : undefined
                                    }
                                    onClick={() => changePage(page)}
                                >
                                    {page}
                                </Button>
                            ))}
                            <Button
                                variant="secondary"
                                size="icon"
                                aria-label="Next page"
                                disabled={
                                    pagination.current_page >=
                                    pagination.last_page
                                }
                                onClick={() =>
                                    changePage(pagination.current_page + 1)
                                }
                                startIcon={
                                    <ChevronRight
                                        size={16}
                                        aria-hidden="true"
                                    />
                                }
                            />
                            <Button
                                variant="secondary"
                                size="icon"
                                aria-label="Last page"
                                disabled={
                                    pagination.current_page >=
                                    pagination.last_page
                                }
                                onClick={() => changePage(pagination.last_page)}
                                startIcon={
                                    <ChevronsRight
                                        size={16}
                                        aria-hidden="true"
                                    />
                                }
                            />
                        </nav>
                    </div>
                )}
                <div className="flex shrink-0 items-center gap-2">
                    <Button
                        variant="secondary"
                        size="icon"
                        startIcon={<SortIcon size={17} aria-hidden="true" />}
                        onClick={() =>
                            router.reload({
                                data: {
                                    sort: priceSort === 'asc' ? 'desc' : 'asc',
                                    page: 1,
                                },
                                only: ['products'],
                            })
                        }
                        aria-label={sortLabel}
                    />
                    <Button
                        variant="secondary"
                        size="icon"
                        startIcon={<LayoutIcon size={17} aria-hidden="true" />}
                        onClick={() =>
                            setLayoutIndex(
                                (current) => (current + 1) % layouts.length,
                            )
                        }
                        aria-label={`Current layout: ${layout.label}. Switch to ${layouts[(layoutIndex + 1) % layouts.length].label}`}
                    />
                </div>
            </div>
            {!products ? (
                <p className="animate-pulse">Loading products...</p>
            ) : products.data.length === 0 ? (
                <div
                    role="status"
                    className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 overflow-y-auto rounded-2xl border border-dashed border-white/10 bg-linear-to-br from-white/3 to-violet-400/5 p-6 text-center"
                >
                    <div className="grid size-20 shrink-0 place-items-center rounded-3xl border border-violet-300/15 bg-violet-400/8 text-violet-300 shadow-[0_0_40px_rgba(139,92,246,0.08)]">
                        <PackageSearch
                            size={36}
                            strokeWidth={1.5}
                            aria-hidden="true"
                        />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-base font-medium text-zinc-100">
                            No products found
                        </h3>
                        <p className="max-w-sm text-sm leading-6 text-ui-secondary">
                            Try a different product name or clear your search to
                            see all products.
                        </p>
                    </div>
                </div>
            ) : (
                <div
                    className={`grid min-h-0 flex-1 auto-rows-max gap-4 overflow-x-hidden overflow-y-auto overscroll-contain pr-2 ${layout.classes}`}
                >
                    {products.data.map((product) => (
                        <Product
                            product={product}
                            key={product.id}
                            layout={layout.list ? 'list' : 'grid'}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
