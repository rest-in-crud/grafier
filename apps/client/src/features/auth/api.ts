import {
  type User,
  type SignInValues,
  type SignUpValues,
  type RefreshResponse,
  type AuthResponse,
  userSchema,
  refreshResponseSchema,
  authResponseSchema,
} from '@/features/auth/schema';
import { getAccessToken, setAccessToken } from '@/features/auth/token';
import { clearAuth } from '@/features/auth/lib';
import { createApiClient } from '@/shared/lib/api-client';

const apiClient = createApiClient({
  baseUrl: import.meta.env.VITE_URL_BACKEND ?? '/api',
  getToken: getAccessToken,
  onRefresh: async () => {
    const { accessToken } = await api.refresh();
    setAccessToken(accessToken);
  },
  onUnauthorized: clearAuth,
});

const api = {
  signIn: async (credentials: SignInValues): Promise<AuthResponse> => {
    const data = await apiClient.post('/auth/login', credentials, {
      skipAuthRefresh: true,
    });
    return authResponseSchema.parse(data);
  },
  signUp: async (credentials: SignUpValues): Promise<AuthResponse> => {
    const data = await apiClient.post('/auth/register', credentials, {
      skipAuthRefresh: true,
    });
    return authResponseSchema.parse(data);
  },
  refresh: async (): Promise<RefreshResponse> => {
    const data = await apiClient.post('/auth/refresh', undefined, {
      skipAuthRefresh: true,
    });
    return refreshResponseSchema.parse(data);
  },
  me: async (options?: { skipAuthRefresh?: boolean }): Promise<User> => {
    const data = await apiClient.get('/auth/me', options);
    return userSchema.parse(data);
  },
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout', undefined, {
      skipAuthRefresh: true,
    });
  },
};

export { api };
