import { apiClient } from '@/lib/api-client';

import type { ResourceCounts, ResourceListMeta } from '../types';
import type { ApiPaginatedResponse } from '@/types/api';

export const resourcesApi = {
  /** Boilerplate probe: fetch minimal data just for the meta counts (FR-4). */
  async counts(): Promise<{ counts: ResourceCounts; totalItems: number }> {
    const { data } = await apiClient.get<ApiPaginatedResponse<unknown[], ResourceListMeta>>(
      '/resources',
      { params: { page: 1, limit: 1 } },
    );
    return { counts: data.meta.counts, totalItems: data.meta.totalItems };
  },
};
