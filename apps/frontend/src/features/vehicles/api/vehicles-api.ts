import { PAGINATION } from '@/config/constants';
import { apiClient } from '@/lib/api-client';
import { buildFormData } from '@/lib/form-data';

import type { Vehicle, VehicleListMeta, VehiclePhotosValue } from '../types';
import type { VehicleFormInput } from '../schemas/vehicle-form-schema';
import type { ApiPaginatedResponse, ApiSuccessResponse } from '@/types/api';

/** Every file to upload: replacements for existing slots, plus new additions. */
function collectPhotoFiles(photos: VehiclePhotosValue): File[] {
  const replacements = photos.existing
    .map((slot) => slot.value.file)
    .filter((file): file is File => Boolean(file));
  return [...replacements, ...photos.newFiles];
}

/**
 * Existing photo ids left untouched — sent so the backend knows what to
 * keep. A slot with a replacement file is *not* kept: its original id is
 * dropped here, and the replacement itself is uploaded as a new photo by
 * collectPhotoFiles — otherwise the original would survive alongside the
 * replacement instead of being replaced by it.
 */
function collectKeptPhotoIds(photos: VehiclePhotosValue): string[] {
  return photos.existing
    .filter((slot) => !slot.value.file && !slot.value.removed)
    .map((slot) => slot.photoId);
}

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

  async create(input: VehicleFormInput): Promise<Vehicle> {
    const { photos, ...rest } = input;
    const { data } = await apiClient.post<ApiSuccessResponse<Vehicle>>(
      '/vehicles',
      buildFormData({ ...rest }, { photos: collectPhotoFiles(photos) }),
    );
    return data.data;
  },

  async update(id: string, input: VehicleFormInput): Promise<Vehicle> {
    const { photos, ...rest } = input;
    const { data } = await apiClient.patch<ApiSuccessResponse<Vehicle>>(
      `/vehicles/${id}`,
      buildFormData(
        { ...rest, photos: collectKeptPhotoIds(photos) },
        { photos: collectPhotoFiles(photos) },
      ),
    );
    return data.data;
  },

  async delete(id: string): Promise<{ id: string }> {
    const { data } = await apiClient.delete<ApiSuccessResponse<{ id: string }>>(`/vehicles/${id}`);
    return data.data;
  },
};
