import { apiClient } from '@/lib/api-client';

import type { LoginInput } from '../schemas/login-schema';
import type { AuthUser } from '../types';
import type { ApiSuccessResponse } from '@/types/api';

export const authApi = {
  async login(input: LoginInput): Promise<AuthUser> {
    const { data } = await apiClient.post<ApiSuccessResponse<{ user: AuthUser }>>(
      '/auth/login',
      input,
    );
    return data.data.user;
  },

  async me(): Promise<AuthUser> {
    const { data } = await apiClient.get<ApiSuccessResponse<{ user: AuthUser }>>('/auth/me');
    return data.data.user;
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },
};
