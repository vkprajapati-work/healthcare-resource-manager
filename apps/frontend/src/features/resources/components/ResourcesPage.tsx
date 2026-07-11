import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { Spinner } from '@/components/common/Spinner';

import { useResourceCounts } from '../hooks/use-resource-counts';

/**
 * Public landing page (boilerplate). Probes the live API for resource counts
 * to prove connectivity and demonstrate the loading/error/empty pattern; the
 * paginated resource list replaces this content when the feature is built.
 */
export function ResourcesPage() {
  const { data, isPending, isError, error, refetch } = useResourceCounts();

  return (
    <section>
      <h1 className="mb-2 text-2xl font-semibold">Resources</h1>
      <p className="mb-8 text-slate-600">
        Find nearby ambulance services and doctors quickly in emergencies.
      </p>

      {isPending ? <Spinner label="Loading resource counts" /> : null}

      {isError ? (
        <ErrorState
          message={error instanceof Error ? error.message : 'Failed to load resources.'}
          onRetry={() => void refetch()}
        />
      ) : null}

      {data && data.totalItems === 0 ? <EmptyState message="No resources available yet." /> : null}

      {data && data.totalItems > 0 ? (
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <dt className="text-sm text-slate-600">Ambulances</dt>
            <dd className="text-3xl font-semibold">{data.counts.ambulance}</dd>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <dt className="text-sm text-slate-600">Doctors</dt>
            <dd className="text-3xl font-semibold">{data.counts.doctor}</dd>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <dt className="text-sm text-slate-600">Total resources</dt>
            <dd className="text-3xl font-semibold">{data.totalItems}</dd>
          </div>
        </dl>
      ) : null}
    </section>
  );
}
