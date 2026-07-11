import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { vehicleKeys } from '../api/query-keys';
import { vehiclesApi } from '../api/vehicles-api';

import type { VehicleFormInput } from '../schemas/vehicle-form-schema';

export function useVehiclesList(page: number) {
  return useQuery({
    queryKey: vehicleKeys.list({ page }),
    queryFn: () => vehiclesApi.list({ page }),
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

export function useCreateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ input, photos }: { input: VehicleFormInput; photos: File[] }) =>
      vehiclesApi.create(input, photos),
    // The form renders failures inline — skip the global error toast.
    meta: { silenceErrorToast: true },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: vehicleKeys.all });
    },
  });
}
