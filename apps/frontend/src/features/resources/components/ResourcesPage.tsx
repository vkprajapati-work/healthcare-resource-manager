import { useEffect, useState } from 'react';

import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { Pagination } from '@/components/common/Pagination';
import { SearchInput } from '@/components/common/SearchInput';
import { Skeleton } from '@/components/ui/Skeleton';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { cn } from '@/lib/utils';

import { useResourceListParams, useResourcesList } from '../hooks/use-resources';
import { ResourceCard } from './ResourceCard';

import type { ResourceType } from '../types';

const FILTERS: { label: string; value: ResourceType | undefined }[] = [
  { label: 'All', value: undefined },
  { label: 'Ambulances', value: 'ambulance' },
  { label: 'Doctors', value: 'doctor' },
];

export function ResourcesPage() {
  const { page, setPage, type, setType, search, setSearch } = useResourceListParams();
  const [searchInput, setSearchInput] = useState(search);
  const debouncedSearch = useDebouncedValue(searchInput, 400);

  // The URL is the source of truth the query reads from; sync it once typing settles.
  useEffect(() => {
    if (debouncedSearch.trim() !== search) {
      setSearch(debouncedSearch);
    }
  }, [debouncedSearch, search, setSearch]);

  const { data, isPending, isError, error, refetch, isFetching } = useResourcesList({
    page,
    type,
    search,
  });

  const counts = data?.meta.counts;
  const hasActiveFilter = Boolean(type) || search.length > 0;

  const clearFilters = (): void => {
    setSearchInput('');
    setSearch('');
    setType(undefined);
  };

  return (
    <section>
      <div className="mb-6">
        <h1 className="mb-2 text-2xl font-semibold">Resources</h1>
        <p className="text-slate-600">
          Find nearby ambulance services and doctors quickly in emergencies.
          {counts ? (
            <span>
              {' '}
              Currently {counts.ambulance} ambulances and {counts.doctor} doctors.
            </span>
          ) : null}
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="w-full sm:max-w-xs">
          <SearchInput
            id="resource-search"
            label="Search"
            value={searchInput}
            onValueChange={setSearchInput}
            placeholder="e.g. a name or specialty"
          />
        </div>
        <div role="group" aria-label="Filter by type" className="flex gap-2">
          {FILTERS.map((filter) => (
            <button
              key={filter.label}
              type="button"
              aria-pressed={type === filter.value}
              onClick={() => setType(filter.value)}
              className={cn(
                'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                type === filter.value
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100',
              )}
            >
              {filter.label}
              {counts && filter.value ? ` (${counts[filter.value]})` : ''}
            </button>
          ))}
        </div>
      </div>

      {isPending ? (
        <div
          role="status"
          aria-live="polite"
          aria-label="Loading resources"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="overflow-hidden rounded-lg border border-slate-200">
              <Skeleton className="aspect-video w-full rounded-none" />
              <div className="flex flex-col gap-2 p-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {isError ? (
        <ErrorState
          message={error instanceof Error ? error.message : 'Failed to load resources.'}
          onRetry={() => void refetch()}
        />
      ) : null}

      {data && data.items.length === 0 ? (
        <EmptyState
          message={
            hasActiveFilter
              ? 'No resources match your search or filter.'
              : 'No resources available yet.'
          }
          action={
            hasActiveFilter ? (
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm font-medium underline underline-offset-4"
              >
                Clear search and filters
              </button>
            ) : undefined
          }
        />
      ) : null}

      {data && data.items.length > 0 ? (
        <>
          <div
            className={cn(
              'grid grid-cols-1 gap-4 transition-opacity sm:grid-cols-2 lg:grid-cols-3',
              isFetching ? 'opacity-70' : 'opacity-100',
            )}
          >
            {data.items.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
          <Pagination page={page} totalPages={data.meta.totalPages} onPageChange={setPage} />
        </>
      ) : null}
    </section>
  );
}
