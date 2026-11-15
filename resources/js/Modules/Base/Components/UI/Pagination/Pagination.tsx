import { router } from '@inertiajs/react';
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from 'lucide-react';
import Button from '../Buttons/Button';
import { MetaResponse } from '@/Modules/Base/Types/Responses';

type PropsType = { pagination: MetaResponse };

export default function Pagination({ pagination }: PropsType) {
    const pageNumbers = Array.from(
        { length: Math.min(5, pagination.last_page) },
        (_, index) =>
            Math.max(
                1,
                Math.min(pagination.current_page - 2, pagination.last_page - 4),
            ) + index,
    );
    const changePage = (page: number, perPage?: number) =>
        router.reload({
            data: { page, ...(perPage ? { per_page: perPage } : {}) },
            only: ['products'],
        });
    return (
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
                    startIcon={<ChevronsLeft size={16} aria-hidden="true" />}
                />
                <Button
                    variant="secondary"
                    size="icon"
                    aria-label="Previous page"
                    disabled={pagination.current_page === 1}
                    onClick={() => changePage(pagination.current_page - 1)}
                    startIcon={<ChevronLeft size={16} aria-hidden="true" />}
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
                    disabled={pagination.current_page >= pagination.last_page}
                    onClick={() => changePage(pagination.current_page + 1)}
                    startIcon={<ChevronRight size={16} aria-hidden="true" />}
                />
                <Button
                    variant="secondary"
                    size="icon"
                    aria-label="Last page"
                    disabled={pagination.current_page >= pagination.last_page}
                    onClick={() => changePage(pagination.last_page)}
                    startIcon={<ChevronsRight size={16} aria-hidden="true" />}
                />
            </nav>
        </div>
    );
}
