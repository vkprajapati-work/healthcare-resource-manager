import { PAGINATION } from '@/config/constants';
import { apiClient } from '@/lib/api-client';
import { buildFormData } from '@/lib/form-data';

import type { Driver, DriverCreateResult, DriverListMeta } from '../types';
import type { DriverFormInput } from '../schemas/driver-form-schema';
import type { ApiPaginatedResponse, ApiSuccessResponse } from '@/types/api';

export const driversApi = {
  async list(params: { page: number; limit?: number; search?: string | undefined }): Promise<{
    items: Driver[];
    meta: DriverListMeta;
  }> {
    const { data } = await apiClient.get<ApiPaginatedResponse<Driver[], DriverListMeta>>(
      '/drivers',
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

  async create(input: DriverFormInput): Promise<DriverCreateResult> {
    const { profileImage, ...rest } = input;
    const { data } = await apiClient.post<ApiSuccessResponse<DriverCreateResult>>(
      '/drivers',
      buildFormData({ ...rest }, { profileImage: profileImage.file ? [profileImage.file] : [] }),
    );
    return data.data;
  },

  async update(id: string, input: DriverFormInput): Promise<Driver> {
    const { profileImage, ...rest } = input;
    const { data } = await apiClient.patch<ApiSuccessResponse<Driver>>(
      `/drivers/${id}`,
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
    const { data } = await apiClient.delete<ApiSuccessResponse<{ id: string }>>(`/drivers/${id}`);
    return data.data;
  },
};
