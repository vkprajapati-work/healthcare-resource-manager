import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

import { resourceKeys } from '../api/query-keys';
import { resourcesApi } from '../api/resources-api';

import type { ResourceType } from '../types';

/** The type filter lives in the URL — shareable and refresh-safe. */
export function useResourceListParams(): {
  type: ResourceType | undefined;
  setType: (type: ResourceType | undefined) => void;
} {
  const [searchParams, setSearchParams] = useSearchParams();

  const rawType = searchParams.get('type');
  const type: ResourceType | undefined =
    rawType === 'ambulance' || rawType === 'doctor' ? rawType : undefined;

  const setType = useCallback(
    (nextType: ResourceType | undefined) => {
      setSearchParams((previous) => {
        const next = new URLSearchParams(previous);
        if (nextType) {
          next.set('type', nextType);
        } else {
          next.delete('type');
        }
        return next;
      });
    },
    [setSearchParams],
  );

  return { type, setType };
}

/** Infinite list: pages accumulate as the user scrolls (10 per fetch). */
export function useInfiniteResourcesList(params: {
  type?: ResourceType | undefined;
  search?: string | undefined;
}) {
  return useInfiniteQuery({
    queryKey: resourceKeys.list(params),
    queryFn: ({ pageParam }) => resourcesApi.list({ page: pageParam, ...params }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.page < lastPage.meta.totalPages ? lastPage.meta.page + 1 : undefined,
    placeholderData: keepPreviousData,
  });
}
