export const resourceKeys = {
  all: ['resources'] as const,
  counts: () => [...resourceKeys.all, 'counts'] as const,
};
