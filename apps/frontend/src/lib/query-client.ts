import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { GENERIC_ERROR_MESSAGE } from '@/config/constants';
import { ApiError } from '@/types/api';

declare module '@tanstack/react-query' {
  interface Register {
    mutationMeta: {
      /** Set when the caller renders the error itself (e.g. inline form errors). */
      silenceErrorToast?: boolean;
    };
    queryMeta: {
      /** Set when the caller already renders a full-page ErrorState for this query. */
      silenceErrorToast?: boolean;
    };
  }
}

function toastServerError(error: unknown): void {
  // Rate limiting already reads clearly inline (retry countdown) and can fire
  // often — a toast on top of it is just noise.
  if (error instanceof ApiError && error.status === 429) {
    return;
  }
  toast.error(error instanceof ApiError ? error.message : GENERIC_ERROR_MESSAGE);
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
  // Every failed query/mutation surfaces as a toast unless the caller opted
  // out because it already renders the error inline (e.g. a full ErrorState).
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (query.meta?.silenceErrorToast) {
        return;
      }
      toastServerError(error);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      if (mutation.options.meta?.silenceErrorToast) {
        return;
      }
      toastServerError(error);
    },
  }),
});
