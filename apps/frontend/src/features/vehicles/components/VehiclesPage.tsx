import { useState } from 'react';
import toast from 'react-hot-toast';

import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { Pagination } from '@/components/common/Pagination';
import { Spinner } from '@/components/common/Spinner';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@/components/ui/Table';
import { usePaginationParams } from '@/hooks/use-pagination-params';
import { toAbsoluteFileUrl } from '@/lib/file-url';

import { useCreateVehicle, useVehiclesList } from '../hooks/use-vehicles';
import { VEHICLE_TYPE_LABELS } from '../types';
import { VehicleForm } from './VehicleForm';

export function VehiclesPage() {
  const { page, setPage } = usePaginationParams();
  const { data, isPending, isError, error, refetch } = useVehiclesList(page);
  const createVehicle = useCreateVehicle();
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <section>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Vehicles</h1>
        <Button onClick={() => setIsFormOpen(true)}>Add vehicle</Button>
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
          message="No vehicles yet."
          action={<Button onClick={() => setIsFormOpen(true)}>Add the first vehicle</Button>}
        />
      ) : null}

      {data && data.items.length > 0 ? (
        <>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Photo</TableHeaderCell>
                <TableHeaderCell>Registration</TableHeaderCell>
                <TableHeaderCell>Type</TableHeaderCell>
                <TableHeaderCell>Brand / Model</TableHeaderCell>
                <TableHeaderCell>Capacity</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.items.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell>
                    {vehicle.photos[0] ? (
                      <img
                        src={toAbsoluteFileUrl(vehicle.photos[0].fileUrl)}
                        alt={`${vehicle.brand} ${vehicle.model}`}
                        loading="lazy"
                        className="size-10 rounded-md object-cover"
                      />
                    ) : (
                      <span className="flex size-10 items-center justify-center rounded-md bg-slate-100 text-xs text-slate-400">
                        —
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{vehicle.registrationNumber}</TableCell>
                  <TableCell>{VEHICLE_TYPE_LABELS[vehicle.vehicleType]}</TableCell>
                  <TableCell>
                    {vehicle.brand} {vehicle.model}
                  </TableCell>
                  <TableCell>
                    {vehicle.seatingCapacity} seats / {vehicle.patientCapacity} patients
                  </TableCell>
                  <TableCell>{vehicle.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
          onSubmit={async (input, photos) => {
            await createVehicle.mutateAsync({ input, photos });
            toast.success('Vehicle created.');
            setIsFormOpen(false);
          }}
        />
      </Dialog>
    </section>
  );
}
