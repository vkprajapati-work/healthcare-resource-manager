import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { doctorKeys } from '../api/query-keys';
import { doctorsApi } from '../api/doctors-api';

import type { DoctorFormInput } from '../schemas/doctor-form-schema';

export function useDoctorsList(params: { page: number; search?: string | undefined }) {
  return useQuery({
    queryKey: doctorKeys.list(params),
    queryFn: () => doctorsApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useUpdateDoctor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
      profileImage,
    }: {
      id: string;
      input: DoctorFormInput;
      profileImage: File[];
    }) => doctorsApi.update(id, input, profileImage),
    // The form renders failures inline — skip the global error toast.
    meta: { silenceErrorToast: true },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: doctorKeys.all });
      void queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
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
