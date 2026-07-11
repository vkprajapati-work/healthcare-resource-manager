import { PAGINATION } from '@/config/constants';
import { apiClient } from '@/lib/api-client';
import { buildFormData } from '@/lib/form-data';

import type { Vehicle, VehicleListMeta } from '../types';
import type { VehicleFormInput } from '../schemas/vehicle-form-schema';
import type { ApiPaginatedResponse, ApiSuccessResponse } from '@/types/api';

export const vehiclesApi = {
  async list(params: { page: number; limit?: number }): Promise<{
    items: Vehicle[];
    meta: VehicleListMeta;
  }> {
    const { data } = await apiClient.get<ApiPaginatedResponse<Vehicle[], VehicleListMeta>>(
      '/vehicles',
      { params: { page: params.page, limit: params.limit ?? PAGINATION.defaultLimit } },
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
};
