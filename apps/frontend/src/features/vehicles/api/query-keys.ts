export const vehicleKeys = {
  all: ['vehicles'] as const,
  lists: () => [...vehicleKeys.all, 'list'] as const,
  list: (params: { page: number }) => [...vehicleKeys.lists(), params] as const,
  options: () => [...vehicleKeys.all, 'options'] as const,
};
