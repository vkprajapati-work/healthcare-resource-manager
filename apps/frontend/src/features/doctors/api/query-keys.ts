export const doctorKeys = {
  all: ['doctors'] as const,
  lists: () => [...doctorKeys.all, 'list'] as const,
  list: (params: { page: number; search?: string | undefined }) =>
    [...doctorKeys.lists(), params] as const,
};
