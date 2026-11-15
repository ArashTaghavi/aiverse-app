import { useEffect, useState } from 'react';
import { Grid3X3, LayoutGrid, List, Search, PackageSearch } from 'lucide-react';
import { router, usePage } from '@inertiajs/react';
import { ProductResponse } from '@/Modules/CustomerSupport/Types/Responses/ProductResponse';
import Product from './Product';
import SearchProduct from './Search';
import { MetaResponse } from '@/Modules/Base/Types/Responses';
import { Button, GridSort, Pagination } from '@/Modules/Base/Components/UI';

type PropsType = {
    products?: {
        data: ProductResponse[];
        meta: MetaResponse;
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

    const layout = layouts[layoutIndex];
    const LayoutIcon = layout.icon;
    const pagination = products?.meta;
    const requestedSort = new URLSearchParams(url.split('?')[1]).get('sort');
    const direction =
        requestedSort === 'asc' || requestedSort === 'desc'
            ? requestedSort
            : null;
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
                {pagination && <Pagination pagination={pagination} />}
                <GridSort
                    field="price"
                    direction={direction}
                    disabled={searching}
                    onSort={(_field, sort) =>
                        router.reload({
                            data: { sort, page: 1 },
                            only: ['products'],
                        })
                    }
                >
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
                </GridSort>
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
