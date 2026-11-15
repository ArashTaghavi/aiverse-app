import { Package } from 'lucide-react';

export type SupportProduct = {
    id: number;
    title: string;
    description: string | null;
    price: number;
    stock: number;
    image?: string | null;
};

export default function Product({ product }: { product: SupportProduct }) {
    const available = product.stock > 0;
    const image = product.image
        ? /^(https?:\/\/|\/)/.test(product.image)
            ? product.image
            : `/uploads/${product.image}`
        : null;

    return (
        <article
            dir="rtl"
            className="group flex min-w-0 flex-col gap-4 rounded-2xl border border-white/10 bg-linear-to-br from-white/5 to-violet-400/5 p-4 transition-colors hover:border-violet-300/30 sm:flex-row sm:items-center"
        >
            <div className="relative flex h-36 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white sm:size-28">
                <Package
                    size={32}
                    className="text-zinc-300"
                    aria-hidden="true"
                />
                {image && (
                    <img
                        src={image}
                        alt={product.title}
                        loading="lazy"
                        onError={(event) => {
                            event.currentTarget.hidden = true;
                        }}
                        className="absolute inset-0 size-full bg-white object-contain p-3 transition-transform duration-300 motion-safe:group-hover:scale-105"
                    />
                )}
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-2">
                <h3
                    dir="auto"
                    className="text-sm leading-6 font-semibold text-zinc-100"
                >
                    {product.title}
                </h3>
                {product.description && (
                    <p
                        dir="auto"
                        className="line-clamp-2 text-xs leading-6 text-ui-secondary"
                    >
                        {product.description}
                    </p>
                )}
                <span
                    className={`inline-flex items-center gap-1.5 self-start text-xs ${available ? 'text-emerald-300' : 'text-ui-muted'}`}
                >
                    <span
                        className={`size-1.5 rounded-full ${available ? 'bg-emerald-400' : 'bg-zinc-500'}`}
                    />
                    {available
                        ? `${product.stock.toLocaleString('fa-IR')} عدد موجود`
                        : 'ناموجود'}
                </span>
            </div>

            <div className="flex shrink-0 items-center justify-between gap-3 border-t border-white/8 pt-3 sm:flex-col sm:items-end sm:border-t-0 sm:border-r sm:pt-0 sm:pr-5">
                <span className="text-xs text-ui-muted">قیمت</span>
                <span className="text-lg font-semibold text-violet-200 tabular-nums">
                    {product.price.toLocaleString('fa-IR')}
                </span>
            </div>
        </article>
    );
}
