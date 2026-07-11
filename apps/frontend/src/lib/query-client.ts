import { MutationCache, QueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { GENERIC_ERROR_MESSAGE } from '@/config/constants';
import { ApiError } from '@/types/api';

declare module '@tanstack/react-query' {
  interface Register {
    mutationMeta: {
      /** Set when the caller renders the error itself (e.g. inline form errors). */
      silenceErrorToast?: boolean;
    };
  }
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (failureCount, error) => {
        // Auth/validation failures won't succeed on retry.
        if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
          return false;
        }
        return failureCount < 2;
      },
    },
  },
  // Global fallback: every failed mutation surfaces as a toast unless the
  // mutation opted out to render the error itself.
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      if (mutation.options.meta?.silenceErrorToast) {
        return;
      }
      toast.error(error instanceof ApiError ? error.message : GENERIC_ERROR_MESSAGE);
    },
  }),
});
