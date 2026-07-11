import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { vehicleKeys } from '../api/query-keys';
import { vehiclesApi } from '../api/vehicles-api';

import type { VehicleFormInput } from '../schemas/vehicle-form-schema';

export function useVehiclesList(params: { page: number; search?: string | undefined }) {
  return useQuery({
    queryKey: vehicleKeys.list(params),
    queryFn: () => vehiclesApi.list(params),
    placeholderData: keepPreviousData,
  });
}

/** Lightweight id/label pairs for assignment dropdowns (e.g. driver form). */
export function useVehicleOptions() {
  return useQuery({
    queryKey: vehicleKeys.options(),
    queryFn: () => vehiclesApi.list({ page: 1, limit: 100 }),
    select: (result) =>
      result.items.map((vehicle) => ({
        id: vehicle.id,
        label: `${vehicle.registrationNumber} — ${vehicle.brand} ${vehicle.model}`,
      })),
    staleTime: 60_000,
  });
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: VehicleFormInput }) =>
      vehiclesApi.update(id, input),
    // The form renders failures inline — skip the global error toast.
    meta: { silenceErrorToast: true },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: vehicleKeys.all });
      void queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  });
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: VehicleFormInput) => vehiclesApi.create(input),
    // The form renders failures inline — skip the global error toast.
    meta: { silenceErrorToast: true },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: vehicleKeys.all });
    },
  });
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => vehiclesApi.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: vehicleKeys.all });
      void queryClient.invalidateQueries({ queryKey: ['resources'] });
      // Deleting an assigned vehicle clears that driver's assignment.
      void queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
  });
}
