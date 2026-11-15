import {
    ArrowDownNarrowWide,
    ArrowDownWideNarrow,
    ArrowUpDown,
} from 'lucide-react';
import type { ReactNode } from 'react';
import Button from '../Buttons/Button';

export type SortDirection = 'asc' | 'desc';

export type GridSortProps = {
    field: string;
    label?: string;
    direction?: SortDirection | null;
    onSort: (field: string, direction: SortDirection) => void;
    disabled?: boolean;
    children?: ReactNode;
};

export default function GridSort({
    field,
    label = field,
    direction,
    onSort,
    disabled = false,
    children,
}: GridSortProps) {
    const nextDirection = direction === 'asc' ? 'desc' : 'asc';
    const SortIcon =
        direction === 'asc'
            ? ArrowDownNarrowWide
            : direction === 'desc'
              ? ArrowDownWideNarrow
              : ArrowUpDown;
    const sortLabel = `Sort by ${label}: ${nextDirection === 'asc' ? 'ascending' : 'descending'}`;

    return (
        <div className="flex shrink-0 items-center gap-2">
            <Button
                variant="secondary"
                size="icon"
                startIcon={<SortIcon size={17} aria-hidden="true" />}
                onClick={() => onSort(field, nextDirection)}
                disabled={disabled}
                aria-label={sortLabel}
                title={sortLabel}
            />
            {children}
        </div>
    );
}
