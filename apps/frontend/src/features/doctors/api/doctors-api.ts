import { PAGINATION } from '@/config/constants';
import { apiClient } from '@/lib/api-client';
import { buildFormData } from '@/lib/form-data';

import type { Doctor, DoctorCreateResult, DoctorListMeta } from '../types';
import type { DoctorFormInput } from '../schemas/doctor-form-schema';
import type { ApiPaginatedResponse, ApiSuccessResponse } from '@/types/api';

export const doctorsApi = {
  async list(params: { page: number; limit?: number; search?: string | undefined }): Promise<{
    items: Doctor[];
    meta: DoctorListMeta;
  }> {
    const { data } = await apiClient.get<ApiPaginatedResponse<Doctor[], DoctorListMeta>>(
      '/doctors',
      {
        params: {
          page: params.page,
          limit: params.limit ?? PAGINATION.defaultLimit,
          ...(params.search?.trim() ? { search: params.search.trim() } : {}),
        },
      },
    );
    return { items: data.data, meta: data.meta };
  },

  async create(input: DoctorFormInput, profileImage: File[]): Promise<DoctorCreateResult> {
    const { data } = await apiClient.post<ApiSuccessResponse<DoctorCreateResult>>(
      '/doctors',
      buildFormData({ ...input }, { profileImage }),
    );
    return data.data;
  },

  async update(id: string, input: DoctorFormInput, profileImage: File[]): Promise<Doctor> {
    const { data } = await apiClient.patch<ApiSuccessResponse<Doctor>>(
      `/doctors/${id}`,
      buildFormData({ ...input }, { profileImage }),
    );
    return data.data;
  },
};
