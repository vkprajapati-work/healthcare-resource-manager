import { useState } from 'react';
import toast from 'react-hot-toast';

import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { Pagination } from '@/components/common/Pagination';
import { SearchInput } from '@/components/common/SearchInput';
import { Spinner } from '@/components/common/Spinner';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { useListSearch } from '@/hooks/use-list-search';
import { usePaginationParams } from '@/hooks/use-pagination-params';

import {
  useCreateVehicle,
  useDeleteVehicle,
  useUpdateVehicle,
  useVehiclesList,
} from '../hooks/use-vehicles';
import { vehicleToFormDefaults } from '../schemas/vehicle-form-schema';
import { VehicleCard } from './VehicleCard';
import { VehicleDetails } from './VehicleDetails';
import { VehicleForm } from './VehicleForm';

import type { Vehicle } from '../types';

export function VehiclesPage() {
  const { page, setPage } = usePaginationParams();
  const { searchInput, setSearchInput, search } = useListSearch();
  const { data, isPending, isError, error, refetch } = useVehiclesList({ page, search });
  const createVehicle = useCreateVehicle();
  const updateVehicle = useUpdateVehicle();
  const deleteVehicle = useDeleteVehicle();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewing, setViewing] = useState<Vehicle | null>(null);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [deleting, setDeleting] = useState<Vehicle | null>(null);

  return (
    <section>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Vehicles</h1>
          <p className="mt-1 text-sm text-slate-500">
            {data ? `${data.meta.totalItems} registered` : ' '}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-full sm:w-64">
            <SearchInput
              id="vehicle-search"
              label="Search vehicles"
              labelHidden
              value={searchInput}
              onValueChange={setSearchInput}
              placeholder="Search vehicle"
            />
          </div>
          <Button onClick={() => setIsFormOpen(true)}>Add vehicle</Button>
        </div>
      </div>

      {isPending ? <Spinner label="Loading vehicles" /> : null}

      {isError ? (
        <ErrorState
          message={error instanceof Error ? error.message : 'Failed to load vehicles.'}
          onRetry={() => void refetch()}
        />
      ) : null}

      {data && data.items.length === 0 ? (
        <EmptyState
          message={search ? 'No vehicles match your search.' : 'No vehicles yet.'}
          action={
            search ? (
              <Button variant="secondary" onClick={() => setSearchInput('')}>
                Clear search
              </Button>
            ) : (
              <Button onClick={() => setIsFormOpen(true)}>Add the first vehicle</Button>
            )
          }
        />
      ) : null}

      {data && data.items.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.items.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                onView={() => setViewing(vehicle)}
                onEdit={() => setEditing(vehicle)}
                onDelete={() => setDeleting(vehicle)}
              />
            ))}
          </div>
          <Pagination page={page} totalPages={data.meta.totalPages} onPageChange={setPage} />
        </>
      ) : null}

      <Dialog
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title="Add vehicle"
        className="max-w-2xl"
      >
        <VehicleForm
          onCancel={() => setIsFormOpen(false)}
          onSubmit={async (input) => {
            await createVehicle.mutateAsync(input);
            toast.success('Vehicle created.');
            setIsFormOpen(false);
          }}
        />
      </Dialog>

      <Dialog
        open={viewing !== null}
        onClose={() => setViewing(null)}
        title="Vehicle details"
        className="max-w-lg"
      >
        {viewing ? <VehicleDetails vehicle={viewing} /> : null}
      </Dialog>

      <Dialog
        open={editing !== null}
        onClose={() => setEditing(null)}
        title="Edit vehicle"
        className="max-w-2xl"
      >
        {editing ? (
          <VehicleForm
            key={editing.id}
            defaultValues={vehicleToFormDefaults(editing)}
            existingPhotos={editing.photos}
            submitLabel="Save changes"
            onCancel={() => setEditing(null)}
            onSubmit={async (input) => {
              await updateVehicle.mutateAsync({ id: editing.id, input });
              toast.success('Vehicle updated.');
              setEditing(null);
            }}
          />
        ) : null}
      </Dialog>

      <ConfirmDialog
        open={deleting !== null}
        title="Delete vehicle"
        description={
          deleting ? `Delete ${deleting.registrationNumber}? This cannot be undone.` : ''
        }
        confirmLabel="Delete"
        isConfirming={deleteVehicle.isPending}
        onCancel={() => setDeleting(null)}
        onConfirm={async () => {
          if (!deleting) return;
          try {
            await deleteVehicle.mutateAsync(deleting.id);
            toast.success('Vehicle deleted.');
            setDeleting(null);
          } catch {
            // The global mutation-error toast already surfaced this;
            // keep the dialog open so the user can retry.
          }
        }}
      />
    </section>
  );
}
