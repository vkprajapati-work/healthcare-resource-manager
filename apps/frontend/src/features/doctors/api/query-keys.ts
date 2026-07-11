export const doctorKeys = {
  all: ['doctors'] as const,
  lists: () => [...doctorKeys.all, 'list'] as const,
  list: (params: { page: number }) => [...doctorKeys.lists(), params] as const,
};
