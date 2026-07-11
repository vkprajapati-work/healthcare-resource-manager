import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { SearchInput } from '@/components/common/SearchInput';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';
import { useListSearch } from '@/hooks/use-list-search';
import { cn } from '@/lib/utils';

import { useInfiniteResourcesList, useResourceListParams } from '../hooks/use-resources';
import { ResourceCard } from './ResourceCard';

import type { ResourceType } from '../types';

const FILTERS: { label: string; value: ResourceType | undefined }[] = [
  { label: 'All', value: undefined },
  { label: 'Ambulances', value: 'ambulance' },
  { label: 'Doctors', value: 'doctor' },
];

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <Skeleton className="aspect-video w-full rounded-none" />
      <div className="flex flex-col gap-2 p-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  );
}

export function ResourcesPage() {
  const { type, setType } = useResourceListParams();
  const { searchInput, setSearchInput, search } = useListSearch();

  const {
    data,
    isPending,
    isError,
    error,
    refetch,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteResourcesList({ type, search });

  const items = data?.pages.flatMap((page) => page.items) ?? [];
  const firstMeta = data?.pages[0]?.meta;
  const counts = firstMeta?.counts;
  const totalItems = firstMeta?.totalItems ?? 0;
  const hasActiveFilter = Boolean(type) || search.length > 0;
  // Refetching an existing list (filter/search change) — not the initial load
  // and not an append; the current cards dim while fresh ones arrive.
  const isRefreshing = isFetching && !isPending && !isFetchingNextPage;

  const sentinelRef = useInfiniteScroll(
    () => void fetchNextPage(),
    !hasNextPage || isFetchingNextPage || isError,
  );

  const clearFilters = (): void => {
    setSearchInput('');
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

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:max-w-xs">
          <SearchInput
            id="resource-search"
            label="Search resources"
            labelHidden
            value={searchInput}
            onValueChange={setSearchInput}
            placeholder="Search — e.g. a name or specialty"
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
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 hover:text-slate-900',
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
            <SkeletonCard key={index} />
          ))}
        </div>
      ) : null}

      {isError && !data ? (
        <ErrorState
          message={error instanceof Error ? error.message : 'Failed to load resources.'}
          onRetry={() => void refetch()}
        />
      ) : null}

      {data && items.length === 0 ? (
        <EmptyState
          message={
            hasActiveFilter
              ? 'No resources match your search or filter.'
              : 'No resources available yet.'
          }
          action={
            hasActiveFilter ? (
              <Button variant="secondary" onClick={clearFilters}>
                Clear search and filters
              </Button>
            ) : undefined
          }
        />
      ) : null}

      {items.length > 0 ? (
        <>
          <div
            className={cn(
              'grid grid-cols-1 gap-4 transition-opacity sm:grid-cols-2 lg:grid-cols-3',
              isRefreshing ? 'opacity-60' : 'opacity-100',
            )}
          >
            {items.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
            {isFetchingNextPage ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : null}
          </div>

          {isFetchingNextPage ? (
            <p role="status" aria-live="polite" className="sr-only">
              Loading more resources
            </p>
          ) : null}

          <div ref={sentinelRef} aria-hidden="true" className="h-px" />

          <div className="flex flex-col items-center gap-2 py-6">
            {isError && data ? (
              <>
                <p className="text-sm text-red-700">Couldn’t load more resources.</p>
                <Button variant="secondary" size="sm" onClick={() => void fetchNextPage()}>
                  Try again
                </Button>
              </>
            ) : hasNextPage ? (
              <Button
                variant="secondary"
                onClick={() => void fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? 'Loading…' : 'Load more'}
              </Button>
            ) : (
              <p className="text-sm text-slate-400">
                You’ve seen all {totalItems} {totalItems === 1 ? 'resource' : 'resources'}.
              </p>
            )}
          </div>
        </>
      ) : null}
    </section>
  );
}
