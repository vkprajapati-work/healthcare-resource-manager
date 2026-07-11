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

  async create(input: DriverFormInput, profileImage: File[]): Promise<DriverCreateResult> {
    const { data } = await apiClient.post<ApiSuccessResponse<DriverCreateResult>>(
      '/drivers',
      buildFormData({ ...input }, { profileImage }),
    );
    return data.data;
  },

  async update(id: string, input: DriverFormInput, profileImage: File[]): Promise<Driver> {
    const { data } = await apiClient.patch<ApiSuccessResponse<Driver>>(
      `/drivers/${id}`,
      buildFormData({ ...input }, { profileImage }),
    );
    return data.data;
  },
};
