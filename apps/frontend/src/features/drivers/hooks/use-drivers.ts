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
    mutationFn: ({
      id,
      input,
      profileImage,
    }: {
      id: string;
      input: DriverFormInput;
      profileImage: File[];
    }) => driversApi.update(id, input, profileImage),
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
    mutationFn: ({ input, profileImage }: { input: DriverFormInput; profileImage: File[] }) =>
      driversApi.create(input, profileImage),
    // The form renders failures inline — skip the global error toast.
    meta: { silenceErrorToast: true },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: driverKeys.all });
      // Assigning a vehicle changes that vehicle's status/driver.
      void queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
}
