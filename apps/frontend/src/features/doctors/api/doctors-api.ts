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

  async create(input: DoctorFormInput): Promise<DoctorCreateResult> {
    const { profileImage, ...rest } = input;
    const { data } = await apiClient.post<ApiSuccessResponse<DoctorCreateResult>>(
      '/doctors',
      buildFormData({ ...rest }, { profileImage: profileImage.file ? [profileImage.file] : [] }),
    );
    return data.data;
  },

  async update(id: string, input: DoctorFormInput): Promise<Doctor> {
    const { profileImage, ...rest } = input;
    const { data } = await apiClient.patch<ApiSuccessResponse<Doctor>>(
      `/doctors/${id}`,
      buildFormData(
        // An explicit empty-array marker clears the saved photo; omitting
        // the field entirely (undefined) leaves it untouched.
        { ...rest, profileImage: profileImage.removed ? [] : undefined },
        { profileImage: profileImage.file ? [profileImage.file] : [] },
      ),
    );
    return data.data;
  },

  async delete(id: string): Promise<{ id: string }> {
    const { data } = await apiClient.delete<ApiSuccessResponse<{ id: string }>>(`/doctors/${id}`);
    return data.data;
  },
};
