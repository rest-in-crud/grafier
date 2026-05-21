import {
  type User,
  type SignInValues,
  type SignUpValues,
  type RefreshResponse,
  type AuthResponse,
  refreshResponseSchema,
  authResponseSchema,
  meResponseSchema,
  type ForgotPasswordValues,
  type VerifyEmailValues,
} from '@/features/auth/schema';
import { getAccessToken, setAccessToken, clearAccessToken } from '@/features/auth/token';
import { queryClient } from '@/shared/lib/query-client';
import { userQueryKey } from '@/features/auth/query-keys';
import { createApiClient } from '@/shared/lib/api-client';

const apiClient = createApiClient({
  baseUrl: import.meta.env.VITE_URL_BACKEND ?? '/api',
  getToken: getAccessToken,
  onRefresh: async () => {
    const { accessToken } = await api.refresh();
    setAccessToken(accessToken);
  },
  onUnauthorized: () => {
    clearAccessToken();
    queryClient.setQueryData(userQueryKey, null);
  },
});

const api = {
  signIn: async (credentials: SignInValues): Promise<AuthResponse> => {
    const data = await apiClient.post('/auth/login', credentials, {
      skipAuthRefresh: true,
    });
    return authResponseSchema.parse(data);
  },
  signUp: async (credentials: SignUpValues): Promise<void> => {
    await apiClient.post('/auth/register', credentials, { skipAuthRefresh: true });
  },
  refresh: async (): Promise<RefreshResponse> => {
    const data = await apiClient.post('/auth/refresh', undefined, {
      skipAuthRefresh: true,
    });
    return refreshResponseSchema.parse(data);
  },
  forgotPassword: async (values: ForgotPasswordValues): Promise<void> => {
    await apiClient.post('/auth/forgot-password', values, { skipAuthRefresh: true });
  },
  resetPassword: async (token: string, password: string): Promise<void> => {
    await apiClient.post('/auth/reset-password', { password }, { skipAuthRefresh: true, token });
  },
  resendVerification: async (values: VerifyEmailValues): Promise<void> => {
    await apiClient.post('/auth/verify-email', values, { skipAuthRefresh: true });
  },
  confirmEmail: async (token: string): Promise<void> => {
    await apiClient.post('/auth/confirm-email', undefined, { skipAuthRefresh: true, token });
  },
  me: async (options?: { skipAuthRefresh?: boolean }): Promise<User> => {
    const data = await apiClient.get('/auth/me', options);
    return meResponseSchema.parse(data).user;
  },
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout', undefined, {
      skipAuthRefresh: true,
    });
  },
};

export { api };
