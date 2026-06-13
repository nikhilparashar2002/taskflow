import { apiClient } from '@/lib/api-client';
import { API_ROUTES } from '@/lib/constants';
import type { AuthResponse, LoginInput, RegisterInput, User } from '@/types/user';

export const authService = {
  register: async (input: RegisterInput): Promise<AuthResponse> => {
    return apiClient<AuthResponse>(API_ROUTES.auth.register, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  login: async (input: LoginInput): Promise<AuthResponse> => {
    return apiClient<AuthResponse>(API_ROUTES.auth.login, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  logout: async (): Promise<void> => {
    await apiClient<{ message: string }>(API_ROUTES.auth.logout, { method: 'POST' });
  },

  me: async (): Promise<User> => {
    const data = await apiClient<{ user: User }>('/api/auth/me');
    return data.user;
  },
};
