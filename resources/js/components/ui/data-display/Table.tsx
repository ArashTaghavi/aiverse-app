import type { Key, ReactNode } from "react";

export interface TableColumn<T> {
    id: string;
    header: ReactNode;
    cell: (row: T, index: number) => ReactNode;
    rowHeader?: boolean;
    headerClassName?: string;
    cellClassName?: string;
}

export interface TableProps<T> {
    data: readonly T[];
    columns: readonly TableColumn<T>[];
    getRowKey: (row: T) => Key;
    caption: string;
    loading?: boolean;
    loadingRows?: number;
    emptyState?: ReactNode;
    error?: ReactNode;
    className?: string;
    tableClassName?: string;
}

/** Define columns outside the page component when they do not depend on its state. */
export default function Table<T>({
    data,
    columns,
    getRowKey,
    caption,
    loading = false,
    loadingRows = 5,
    emptyState = "No results found.",
    error,
    className = "",
    tableClassName = "",
}: TableProps<T>) {
    return (
        <div className={`overflow-x-auto ${className}`}>
            <table
                className={`w-full text-left text-sm ${tableClassName}`}
                aria-busy={loading}
            >
                <caption className="sr-only">{caption}</caption>
                <thead className="border-b border-ui-border bg-white/[0.035] text-xs tracking-wider text-ui-secondary uppercase">
                    <tr>
                        {columns.map((column) => (
                            <th
                                key={column.id}
                                scope="col"
                                className={`px-4 py-3 font-medium ${column.headerClassName ?? ""}`}
                            >
                                {column.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-ui-border-subtle">
                    {error != null ? (
                        <tr>
                            <td
                                colSpan={columns.length}
                                className="px-4 py-10 text-center"
                            >
                                <div role="alert">{error}</div>
                            </td>
                        </tr>
                    ) : loading ? (
                        Array.from({ length: loadingRows }, (_, row) => (
                            <tr key={row} aria-hidden="true">
                                {columns.map((column) => (
                                    <td key={column.id} className="px-4 py-3">
                                        <div className="h-4 w-3/4 animate-pulse rounded bg-white/10 motion-reduce:animate-none" />
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : data.length === 0 ? (
                        <tr>
                            <td
                                colSpan={columns.length}
                                className="px-4 py-10 text-center text-ui-secondary"
                            >
                                {emptyState}
                            </td>
                        </tr>
                    ) : (
                        data.map((row, index) => (
                            <tr
                                key={getRowKey(row)}
                                className="transition-colors hover:bg-white/[0.035]"
                            >
                                {columns.map((column) => {
                                    const Cell = column.rowHeader ? "th" : "td";
                                    const value = column.cell(row, index);
                                    const isEmpty =
                                        value == null ||
                                        typeof value === "boolean" ||
                                        (typeof value === "string" &&
                                            value.trim() === "");
                                    return (
                                        <Cell
                                            key={column.id}
                                            scope={
                                                column.rowHeader
                                                    ? "row"
                                                    : undefined
                                            }
                                            className={`px-4 py-3 ${column.rowHeader ? "font-medium text-zinc-100" : "text-ui-soft"} ${column.cellClassName ?? ""}`}
                                        >
                                            {isEmpty ? (
                                                <span className="text-ui-muted">
                                                    ---
                                                </span>
                                            ) : (
                                                value
                                            )}
                                        </Cell>
                                    );
                                })}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
