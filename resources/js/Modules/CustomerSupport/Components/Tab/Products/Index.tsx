import { useEffect, useState } from 'react';
import {
    ArrowDownNarrowWide,
    ArrowDownWideNarrow,
    ArrowUpDown,
    Grid3X3,
    LayoutGrid,
    List,
} from 'lucide-react';
import Button from '@/Modules/Base/Components/UI/Buttons/Button';
import { router, usePage } from '@inertiajs/react';
import { ProductResponse } from '@/Modules/CustomerSupport/Types/Responses/ProductResponse';
import Product from './Product';
import SearchProduct from './Search';

type PropsType = {
    products: ProductResponse[];
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
    const { products } = usePage<PropsType>().props;
    const [layoutIndex, setLayoutIndex] = useState(0);
    const [priceSort, setPriceSort] = useState<'asc' | 'desc' | null>(null);
    const sortedProducts = priceSort
        ? [...(products ?? [])].sort((first, second) =>
              priceSort === 'asc'
                  ? first.price - second.price
                  : second.price - first.price,
          )
        : products;
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
    useEffect(() => {
        router.reload({ only: ['products'] });
    }, []);

    return (
        <div className="flex h-full min-h-0 min-w-0 flex-col gap-4">
            <div className="flex shrink-0 items-center justify-between gap-3">
                <SearchProduct />
                <div className="flex shrink-0 items-center gap-2">
                    <Button
                        variant="secondary"
                        size="icon"
                        startIcon={<SortIcon size={17} aria-hidden="true" />}
                        onClick={() =>
                            setPriceSort((current) =>
                                current === 'asc' ? 'desc' : 'asc',
                            )
                        }
                        aria-label={sortLabel}
                        title={sortLabel}
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
                        title="Change layout"
                    />
                </div>
            </div>
            {!products ? (
                <p className="animate-pulse">Loading products...</p>
            ) : (
                <div
                    className={`grid min-h-0 flex-1 auto-rows-max gap-4 overflow-x-hidden overflow-y-auto overscroll-contain pr-2 ${layout.classes}`}
                >
                    {sortedProducts.map((product) => (
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
