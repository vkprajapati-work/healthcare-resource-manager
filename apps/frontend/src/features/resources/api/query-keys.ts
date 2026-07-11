import type { ResourceType } from '../types';

export const resourceKeys = {
  all: ['resources'] as const,
  lists: () => [...resourceKeys.all, 'list'] as const,
  list: (params: { page: number; type?: ResourceType | undefined; search?: string | undefined }) =>
    [...resourceKeys.lists(), params] as const,
};
