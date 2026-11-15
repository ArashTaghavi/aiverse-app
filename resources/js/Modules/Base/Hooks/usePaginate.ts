import { router } from '@inertiajs/react';
import type { MetaResponse } from '../Types/Responses';

export type UsePaginateOptions = {
    meta?: MetaResponse;
    only: string[];
    pageParameter?: string;
    perPageParameter?: string;
};

export default function usePaginate({
    meta,
    only,
    pageParameter = 'page',
    perPageParameter = 'per_page',
}: UsePaginateOptions) {
    const pageNumbers = meta
        ? Array.from(
              { length: Math.min(5, meta.last_page) },
              (_, index) =>
                  Math.max(
                      1,
                      Math.min(meta.current_page - 2, meta.last_page - 4),
                  ) + index,
          )
        : [];

    const changePage = (page: number, perPage?: number) => {
        if (!meta || !Number.isInteger(page) || page < 1) {
            return;
        }

        if (
            perPage !== undefined &&
            (!Number.isInteger(perPage) || perPage < 1)
        ) {
            return;
        }

        const nextPage = perPage !== undefined ? 1 : page;

        if (nextPage > Math.max(1, meta.last_page)) {
            return;
        }

        router.reload({
            data: {
                [pageParameter]: nextPage,
                ...(perPage !== undefined
                    ? { [perPageParameter]: perPage }
                    : {}),
            },
            only,
        });
    };

    return [pageNumbers, changePage] as const;
}
