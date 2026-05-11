import { api } from '@/features/auth/api';
import { setAccessToken } from '@/features/auth/token';
import { useAuthStore } from '@/features/auth/store';
import type { SignInResponse, SignInValues } from '@/features/auth/schema';
import { clearAuth } from '@/features/auth/lib';

const performSignIn = async (values: SignInValues): Promise<SignInResponse> => {
  const result = await api.signIn(values);
  setAccessToken(result.accessToken);
  useAuthStore.getState().setUser(result.user);
  return result;
};

const performRestoreSession = async (): Promise<null> => {
  try {
    const { accessToken } = await api.refresh();
    setAccessToken(accessToken);
    const user = await api.me({ skipAuthRefresh: true });
    useAuthStore.getState().setUser(user);
  } catch {
    clearAuth();
  }

  return null;
};

export { performSignIn, performRestoreSession };
