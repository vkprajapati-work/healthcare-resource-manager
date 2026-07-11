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
    mutationFn: ({ id, input }: { id: string; input: DoctorFormInput }) =>
      doctorsApi.update(id, input),
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
    mutationFn: (input: DoctorFormInput) => doctorsApi.create(input),
    // The form renders failures inline — skip the global error toast.
    meta: { silenceErrorToast: true },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: doctorKeys.all });
      // Doctors are bridged into the public resources list.
      void queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  });
}

export function useDeleteDoctor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => doctorsApi.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: doctorKeys.all });
      void queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  });
}
