import { api } from '@/features/auth/api';
import { setAccessToken } from '@/features/auth/token';
import { useAuthStore } from '@/features/auth/store';
import type { AuthResponse, SignInValues, SignUpValues } from '@/features/auth/schema';
import { clearAuth } from '@/features/auth/lib';
import { redirect } from 'react-router';

const performSignIn = async (values: SignInValues): Promise<AuthResponse> => {
  const result = await api.signIn(values);
  setAccessToken(result.accessToken);
  useAuthStore.getState().setUser(result.user);
  return result;
};

const performSignUp = async (values: SignUpValues): Promise<AuthResponse> => {
  const result = await api.signUp(values);
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

const performLogout = async (): Promise<void> => {
  clearAuth();
  api.logout().catch(() => {});
};

const requireAuth = () => {
  const user = useAuthStore.getState().user;
  if (!user) throw redirect('/signin');
  return null;
};

const requireAnon = () => {
  const user = useAuthStore.getState().user;
  if (user) throw redirect('/');
  return null;
};

export {
  performSignIn,
  performSignUp,
  performRestoreSession,
  performLogout,
  requireAuth,
  requireAnon,
};
