import axios from 'axios';

import { GENERIC_ERROR_MESSAGE } from '@/config/constants';
import { env } from '@/config/env';
import { ApiError } from '@/types/api';

import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { ApiErrorResponse } from '@/types/api';

/**
 * Shared axios instance — the only HTTP entry point. Cookie-based auth
 * (httpOnly JWTs set by the backend) requires `withCredentials: true`.
 */
export const apiClient = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  withCredentials: true,
  timeout: env.VITE_API_TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json' },
});

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retried?: boolean;
}

/** Auth endpoints where a 401 is a final answer, never fixable by a refresh. */
const NO_REFRESH_PATHS = ['/auth/login', '/auth/refresh', '/auth/logout'];

/** One in-flight refresh shared by all concurrently-failing requests. */
let refreshPromise: Promise<void> | null = null;

const refreshSession = (): Promise<void> => {
  refreshPromise ??= apiClient
    .post('/auth/refresh')
    .then(() => undefined)
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
};

const toApiError = (error: AxiosError<ApiErrorResponse>): ApiError => {
  const status = error.response?.status ?? 0;
  const body = error.response?.data?.error;
  if (body) {
    return new ApiError(status, body);
  }
  const message =
    error.code === 'ECONNABORTED'
      ? 'The request timed out. Please try again.'
      : error.code === 'ERR_NETWORK'
        ? 'Unable to reach the server. Check your connection and try again.'
        : GENERIC_ERROR_MESSAGE;
  return new ApiError(status, { code: 'NETWORK_ERROR', message });
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const config = error.config as RetriableConfig | undefined;
    const isRefreshable =
      error.response?.status === 401 &&
      config !== undefined &&
      config._retried !== true &&
      !NO_REFRESH_PATHS.some((path) => config.url?.startsWith(path));

    // Access token may merely be expired — try one refresh, then replay.
    if (isRefreshable) {
      config._retried = true;
      try {
        await refreshSession();
        return await apiClient(config);
      } catch {
        // Refresh failed — fall through to the original 401.
      }
    }

    return Promise.reject(toApiError(error));
  },
);
