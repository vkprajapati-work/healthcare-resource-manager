import { useState } from 'react';
import toast from 'react-hot-toast';

import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { Pagination } from '@/components/common/Pagination';
import { SearchInput } from '@/components/common/SearchInput';
import { Spinner } from '@/components/common/Spinner';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { useListSearch } from '@/hooks/use-list-search';
import { usePaginationParams } from '@/hooks/use-pagination-params';

import { useCreateDriver, useDriversList, useUpdateDriver } from '../hooks/use-drivers';
import { driverToFormDefaults } from '../schemas/driver-form-schema';
import { DriverCard } from './DriverCard';
import { DriverDetails } from './DriverDetails';
import { DriverForm } from './DriverForm';

import type { Driver, ProvisionedLogin } from '../types';

export function DriversPage() {
  const { page, setPage } = usePaginationParams();
  const { searchInput, setSearchInput, search } = useListSearch();
  const { data, isPending, isError, error, refetch } = useDriversList({ page, search });
  const createDriver = useCreateDriver();
  const updateDriver = useUpdateDriver();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewing, setViewing] = useState<Driver | null>(null);
  const [editing, setEditing] = useState<Driver | null>(null);
  const [provisionedLogin, setProvisionedLogin] = useState<ProvisionedLogin | null>(null);

  return (
    <section>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Drivers</h1>
          <p className="mt-1 text-sm text-slate-500">
            {data ? `${data.meta.totalItems} registered` : ' '}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-full sm:w-64">
            <SearchInput
              id="driver-search"
              label="Search drivers"
              labelHidden
              value={searchInput}
              onValueChange={setSearchInput}
              placeholder="Search driver"
            />
          </div>
          <Button onClick={() => setIsFormOpen(true)}>Add driver</Button>
        </div>
      </div>

      {isPending ? <Spinner label="Loading drivers" /> : null}

      {isError ? (
        <ErrorState
          message={error instanceof Error ? error.message : 'Failed to load drivers.'}
          onRetry={() => void refetch()}
        />
      ) : null}

      {data && data.items.length === 0 ? (
        <EmptyState
          message={search ? 'No drivers match your search.' : 'No drivers yet.'}
          action={
            search ? (
              <Button variant="secondary" onClick={() => setSearchInput('')}>
                Clear search
              </Button>
            ) : (
              <Button onClick={() => setIsFormOpen(true)}>Add the first driver</Button>
            )
          }
        />
      ) : null}

      {data && data.items.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.items.map((driver) => (
              <DriverCard
                key={driver.id}
                driver={driver}
                onView={() => setViewing(driver)}
                onEdit={() => setEditing(driver)}
              />
            ))}
          </div>
          <Pagination page={page} totalPages={data.meta.totalPages} onPageChange={setPage} />
        </>
      ) : null}

      <Dialog
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title="Add driver"
        className="max-w-2xl"
      >
        <DriverForm
          onCancel={() => setIsFormOpen(false)}
          onSubmit={async (input, profileImage) => {
            const result = await createDriver.mutateAsync({ input, profileImage });
            toast.success('Driver created.');
            setIsFormOpen(false);
            if (result.login) {
              setProvisionedLogin(result.login);
            }
          }}
        />
      </Dialog>

      <Dialog
        open={viewing !== null}
        onClose={() => setViewing(null)}
        title="Driver details"
        className="max-w-lg"
      >
        {viewing ? <DriverDetails driver={viewing} /> : null}
      </Dialog>

      <Dialog
        open={editing !== null}
        onClose={() => setEditing(null)}
        title="Edit driver"
        className="max-w-2xl"
      >
        {editing ? (
          <DriverForm
            key={editing.id}
            defaultValues={driverToFormDefaults(editing)}
            submitLabel="Save changes"
            onCancel={() => setEditing(null)}
            onSubmit={async (input, profileImage) => {
              await updateDriver.mutateAsync({ id: editing.id, input, profileImage });
              toast.success('Driver updated.');
              setEditing(null);
            }}
          />
        ) : null}
      </Dialog>

      <Dialog
        open={provisionedLogin !== null}
        onClose={() => setProvisionedLogin(null)}
        title="Login credentials created"
      >
        <p className="mb-4 text-sm text-slate-600">
          Share these one-time credentials with the driver — the password is only shown now, and
          they must change it on first sign-in.
        </p>
        <dl className="mb-6 rounded-lg bg-slate-50 p-4 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-600">Email</dt>
            <dd className="font-mono">{provisionedLogin?.email}</dd>
          </div>
          <div className="mt-2 flex justify-between gap-4">
            <dt className="text-slate-600">Temporary password</dt>
            <dd className="font-mono">{provisionedLogin?.defaultPassword}</dd>
          </div>
        </dl>
        <div className="flex justify-end">
          <Button onClick={() => setProvisionedLogin(null)}>Done</Button>
        </div>
      </Dialog>
    </section>
  );
}
