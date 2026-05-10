import { api } from '@/features/auth/api';
import { setAccessToken } from '@/features/auth/token';
import { useAuthStore } from '@/features/auth/store';
import type { SignInResponse, SignInValues } from '@/features/auth/schema';

const performSignIn = async (values: SignInValues): Promise<SignInResponse> => {
  const result = await api.signIn(values);
  setAccessToken(result.accessToken);
  useAuthStore.getState().setUser(result.user);
  return result;
};

export { performSignIn };
