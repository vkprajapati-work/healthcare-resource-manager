import { PAGINATION } from '@/config/constants';
import { apiClient } from '@/lib/api-client';
import { buildFormData } from '@/lib/form-data';

import type { Vehicle, VehicleListMeta } from '../types';
import type { VehicleFormInput } from '../schemas/vehicle-form-schema';
import type { ApiPaginatedResponse, ApiSuccessResponse } from '@/types/api';

export const vehiclesApi = {
  async list(params: { page: number; limit?: number; search?: string | undefined }): Promise<{
    items: Vehicle[];
    meta: VehicleListMeta;
  }> {
    const { data } = await apiClient.get<ApiPaginatedResponse<Vehicle[], VehicleListMeta>>(
      '/vehicles',
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

  async create(input: VehicleFormInput, photos: File[]): Promise<Vehicle> {
    const { data } = await apiClient.post<ApiSuccessResponse<Vehicle>>(
      '/vehicles',
      buildFormData({ ...input }, { photos }),
    );
    return data.data;
  },

  async update(id: string, input: VehicleFormInput, photos: File[]): Promise<Vehicle> {
    const { data } = await apiClient.patch<ApiSuccessResponse<Vehicle>>(
      `/vehicles/${id}`,
      buildFormData({ ...input }, { photos }),
    );
    return data.data;
  },
};
