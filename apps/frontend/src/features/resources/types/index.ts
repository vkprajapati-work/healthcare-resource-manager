import type { PaginationMeta } from '@/types/api';

export type ResourceType = 'ambulance' | 'doctor';

export interface Resource {
  id: string;
  type: ResourceType;
  title: string;
  description: string;
  location: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ResourceCounts {
  ambulance: number;
  doctor: number;
}

export interface ResourceListMeta extends PaginationMeta {
  counts: ResourceCounts;
}
