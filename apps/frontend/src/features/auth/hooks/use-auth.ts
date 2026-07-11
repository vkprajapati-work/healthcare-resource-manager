import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { ApiError } from '@/types/api';

import { authApi } from '../api/auth-api';
import { authKeys } from '../api/query-keys';

import type { AuthUser } from '../types';

/**
 * Session hint: the httpOnly auth cookies are invisible to JS, so this flag
 * records "a login happened here" — anonymous visitors never fire the
 * guaranteed-401 GET /auth/me. It is a boolean hint only, never a credential;
 * the server remains the sole authority (a stale hint just yields one 401,
 * which clears it).
 */
const SESSION_HINT_KEY = 'hrm.has-session';

const sessionHint = {
  get(): boolean {
    try {
      return window.localStorage.getItem(SESSION_HINT_KEY) === '1';
    } catch {
      // Storage unavailable (e.g. blocked) — fall back to asking the server.
      return true;
    }
  },
  set(): void {
    try {
      window.localStorage.setItem(SESSION_HINT_KEY, '1');
    } catch {
      /* non-fatal */
    }
  },
  clear(): void {
    try {
      window.localStorage.removeItem(SESSION_HINT_KEY);
    } catch {
      /* non-fatal */
    }
  },
};

/**
 * The signed-in user, or null when not authenticated. GET /auth/me only runs
 * when the session hint is set; without it the answer is synchronously null.
 * A 401 is the expected "signed out" answer, not an error worth retrying.
 */
export function useCurrentUser() {
  const hasSessionHint = sessionHint.get();

  return useQuery<AuthUser | null>({
    queryKey: authKeys.me(),
    queryFn: async () => {
      try {
        return await authApi.me();
      } catch (error) {
        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          sessionHint.clear();
          return null;
        }
        throw error;
      }
    },
    enabled: hasSessionHint,
    // Known signed-out without a request; keeps ProtectedRoute from pending forever.
    ...(hasSessionHint ? {} : { initialData: null }),
    staleTime: 60_000,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.login,
    // The login form renders failures inline — skip the global error toast.
    meta: { silenceErrorToast: true },
    onSuccess: (user) => {
      sessionHint.set();
      queryClient.setQueryData(authKeys.me(), user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      sessionHint.clear();
      queryClient.setQueryData(authKeys.me(), null);
      void queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
  });
}
