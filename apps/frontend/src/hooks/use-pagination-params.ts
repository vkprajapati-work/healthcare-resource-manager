import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

import { PAGINATION } from '@/config/constants';

/**
 * Pagination state in the URL (?page=2) so views are shareable and
 * refresh-safe, per docs/COMPONENT_GUIDELINES.md §5.
 */
export function usePaginationParams(): {
  page: number;
  limit: number;
  setPage: (page: number) => void;
} {
  const [searchParams, setSearchParams] = useSearchParams();

  const parsed = Number.parseInt(searchParams.get('page') ?? '', 10);
  const page = Number.isInteger(parsed) && parsed >= 1 ? parsed : PAGINATION.defaultPage;

  const setPage = useCallback(
    (nextPage: number) => {
      setSearchParams(
        (previous) => {
          const next = new URLSearchParams(previous);
          if (nextPage <= PAGINATION.defaultPage) {
            next.delete('page');
          } else {
            next.set('page', String(nextPage));
          }
          return next;
        },
        { replace: false },
      );
    },
    [setSearchParams],
  );

  return { page, limit: PAGINATION.defaultLimit, setPage };
}
