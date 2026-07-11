export const driverKeys = {
  all: ['drivers'] as const,
  lists: () => [...driverKeys.all, 'list'] as const,
  list: (params: { page: number }) => [...driverKeys.lists(), params] as const,
};
