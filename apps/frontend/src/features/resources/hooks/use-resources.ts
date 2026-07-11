import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

import { usePaginationParams } from '@/hooks/use-pagination-params';

import { resourceKeys } from '../api/query-keys';
import { resourcesApi } from '../api/resources-api';

import type { ResourceType } from '../types';

/**
 * List filters live in the URL (?page=2&type=doctor&search=cardio) —
 * shareable and refresh-safe. Changing a filter restarts at page 1.
 */
export function useResourceListParams(): {
  page: number;
  setPage: (page: number) => void;
  type: ResourceType | undefined;
  setType: (type: ResourceType | undefined) => void;
  search: string;
  setSearch: (search: string) => void;
} {
  const { page, setPage } = usePaginationParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const rawType = searchParams.get('type');
  const type: ResourceType | undefined =
    rawType === 'ambulance' || rawType === 'doctor' ? rawType : undefined;
  const search = searchParams.get('search') ?? '';

  const setType = useCallback(
    (nextType: ResourceType | undefined) => {
      setSearchParams((previous) => {
        const next = new URLSearchParams(previous);
        if (nextType) {
          next.set('type', nextType);
        } else {
          next.delete('type');
        }
        next.delete('page');
        return next;
      });
    },
    [setSearchParams],
  );

  const setSearch = useCallback(
    (nextSearch: string) => {
      setSearchParams(
        (previous) => {
          const next = new URLSearchParams(previous);
          const trimmed = nextSearch.trim();
          if (trimmed) {
            next.set('search', trimmed);
          } else {
            next.delete('search');
          }
          next.delete('page');
          return next;
        },
        { replace: true }, // Keystroke-driven — don't spam browser history.
      );
    },
    [setSearchParams],
  );

  return { page, setPage, type, setType, search, setSearch };
}

export function useResourcesList(params: {
  page: number;
  type?: ResourceType | undefined;
  search?: string | undefined;
}) {
  return useQuery({
    queryKey: resourceKeys.list(params),
    queryFn: () => resourcesApi.list(params),
    placeholderData: keepPreviousData,
  });
}
