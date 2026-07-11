import type { PaginationMeta } from '@/types/api';

export interface ResourceCounts {
  ambulance: number;
  doctor: number;
}

export interface ResourceListMeta extends PaginationMeta {
  counts: ResourceCounts;
}
