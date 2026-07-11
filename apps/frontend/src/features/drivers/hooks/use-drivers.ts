import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { driverKeys } from '../api/query-keys';
import { driversApi } from '../api/drivers-api';

import type { DriverFormInput } from '../schemas/driver-form-schema';

export function useDriversList(params: { page: number; search?: string | undefined }) {
  return useQuery({
    queryKey: driverKeys.list(params),
    queryFn: () => driversApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useUpdateDriver() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: DriverFormInput }) =>
      driversApi.update(id, input),
    // The form renders failures inline — skip the global error toast.
    meta: { silenceErrorToast: true },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: driverKeys.all });
      void queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
}

export function useCreateDriver() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: DriverFormInput) => driversApi.create(input),
    // The form renders failures inline — skip the global error toast.
    meta: { silenceErrorToast: true },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: driverKeys.all });
      // Assigning a vehicle changes that vehicle's status/driver.
      void queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
}

export function useDeleteDriver() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => driversApi.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: driverKeys.all });
      // Deleting an assigned driver clears that vehicle's assignment.
      void queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
}
