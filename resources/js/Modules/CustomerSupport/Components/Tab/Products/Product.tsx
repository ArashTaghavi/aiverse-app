import { Package } from 'lucide-react';
import type { ProductResponse } from '@/Modules/CustomerSupport/Types/Responses/ProductResponse';

export default function Product({
    product,
    layout = 'grid',
}: {
    product: ProductResponse;
    layout?: 'grid' | 'list';
}) {
    return (
        <article
            className={`group relative flex min-h-0 w-full min-w-0 gap-4 rounded-2xl border border-white/10 bg-linear-to-br from-white/8 via-white/3 to-violet-400/5 p-3 shadow-[0_8px_24px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-xl transition-[border-color,box-shadow] duration-300 hover:border-violet-300/30 hover:shadow-[0_8px_28px_rgba(139,92,246,0.1),inset_0_1px_0_rgba(255,255,255,0.15)] ${layout === 'list' ? 'flex-row items-center' : 'flex-col xl:h-full'}`}
        >
            <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-linear-to-r from-transparent via-violet-200/40 to-transparent" />
            <div
                className={`flex items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-white/10 ${layout === 'list' ? 'size-20 shrink-0 p-2 sm:size-24' : 'aspect-square p-5 xl:aspect-auto xl:min-h-0 xl:flex-1'}`}
            >
                <img
                    src={product.image}
                    alt={product.title}
                    loading="lazy"
                    className="size-full object-contain transition-transform duration-300 motion-safe:group-hover:scale-105"
                />
            </div>

            <div
                className={`flex flex-col gap-3 px-1 pb-1 ${layout === 'list' ? 'min-w-0 flex-1' : 'shrink-0'}`}
            >
                <h3 className="line-clamp-2 min-h-12 text-sm leading-6 font-medium text-zinc-100">
                    {product.title}
                </h3>

                {layout === 'list' && product.description && (
                    <p
                        dir="auto"
                        className="line-clamp-2 text-sm leading-6 text-ui-secondary"
                    >
                        {product.description}
                    </p>
                )}

                <div className="flex flex-wrap items-end justify-between gap-2 border-t border-white/8 pt-3">
                    <div className="flex min-w-0 flex-col gap-1">
                        <span className="text-[10px] font-medium tracking-widest text-ui-muted uppercase">
                            Price
                        </span>
                        <span className="text-base font-semibold tracking-tight text-violet-200 tabular-nums">
                            {product.price.toLocaleString('en-US')}
                        </span>
                    </div>
                    <span
                        className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[11px] font-medium tabular-nums ${product.stock > 0 ? 'border-emerald-400/15 bg-emerald-400/8 text-emerald-300' : 'border-rose-400/15 bg-rose-400/8 text-rose-300'}`}
                    >
                        <Package size={12} />
                        {product.stock > 0
                            ? `${product.stock.toLocaleString('en-US')} in stock`
                            : 'Out of stock'}
                    </span>
                </div>
            </div>
        </article>
    );
}
