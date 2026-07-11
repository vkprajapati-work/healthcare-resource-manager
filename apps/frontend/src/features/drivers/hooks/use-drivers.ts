import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { driverKeys } from '../api/query-keys';
import { driversApi } from '../api/drivers-api';

import type { DriverFormInput } from '../schemas/driver-form-schema';

export function useDriversList(page: number) {
  return useQuery({
    queryKey: driverKeys.list({ page }),
    queryFn: () => driversApi.list({ page }),
    placeholderData: keepPreviousData,
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
