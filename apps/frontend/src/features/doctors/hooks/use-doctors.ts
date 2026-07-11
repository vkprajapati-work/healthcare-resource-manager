import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { doctorKeys } from '../api/query-keys';
import { doctorsApi } from '../api/doctors-api';

import type { DoctorFormInput } from '../schemas/doctor-form-schema';

export function useDoctorsList(page: number) {
  return useQuery({
    queryKey: doctorKeys.list({ page }),
    queryFn: () => doctorsApi.list({ page }),
    placeholderData: keepPreviousData,
  });
}

export function useCreateDoctor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ input, profileImage }: { input: DoctorFormInput; profileImage: File[] }) =>
      doctorsApi.create(input, profileImage),
    // The form renders failures inline — skip the global error toast.
    meta: { silenceErrorToast: true },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: doctorKeys.all });
      // Doctors are bridged into the public resources list.
      void queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  });
}
