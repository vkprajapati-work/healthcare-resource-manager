import { PAGINATION } from '@/config/constants';
import { apiClient } from '@/lib/api-client';

import type { Resource, ResourceListMeta, ResourceType } from '../types';
import type { ApiPaginatedResponse } from '@/types/api';

export const resourcesApi = {
  async list(params: {
    page: number;
    type?: ResourceType | undefined;
    search?: string | undefined;
  }): Promise<{
    items: Resource[];
    meta: ResourceListMeta;
  }> {
    const search = params.search?.trim();
    const { data } = await apiClient.get<ApiPaginatedResponse<Resource[], ResourceListMeta>>(
      '/resources',
      {
        params: {
          page: params.page,
          limit: PAGINATION.defaultLimit,
          ...(params.type ? { type: params.type } : {}),
          ...(search ? { search } : {}),
        },
      },
    );
    return { items: data.data, meta: data.meta };
  },
};
