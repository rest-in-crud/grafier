import { api } from '@/features/auth/api';
import { setAccessToken } from '@/features/auth/token';
import { useAuthStore } from '@/features/auth/store';
import type {
  AuthResponse,
  ForgotPasswordValues,
  ResetPasswordValues,
  SignInValues,
  SignUpValues,
  VerifyEmailValues,
} from '@/features/auth/schema';
import { clearAuth } from '@/features/auth/lib';
import { redirect } from 'react-router';

const performSignIn = async (values: SignInValues): Promise<AuthResponse> => {
  const result = await api.signIn(values);
  setAccessToken(result.accessToken);
  useAuthStore.getState().setUser(result.user);
  return result;
};

const performSignUp = async (values: SignUpValues): Promise<void> => {
  await api.signUp(values);
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

const startGoogleOAuth = () => {
  const base = (import.meta.env.VITE_URL_BACKEND ?? '/api').replace(/\/$/, '');
  window.location.href = `${base}/auth/google`;
};

const completeOAuth = async () => {
  await performRestoreSession();
  const user = useAuthStore.getState().user;
  throw redirect(user ? '/' : '/signin?error=oauth');
};

const performLogout = () => {
  clearAuth();
  api.logout().catch(() => {});
};

const performForgotPassword = async (values: ForgotPasswordValues): Promise<void> => {
  await api.forgotPassword(values);
};

const performResetPassword = async (token: string, values: ResetPasswordValues): Promise<void> => {
  await api.resetPassword(token, values.password);
};

const performResendVerification = async (values: VerifyEmailValues): Promise<void> => {
  await api.resendVerification(values);
};

const performConfirmEmail = async (token: string): Promise<void> => {
  await api.confirmEmail(token);
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
  startGoogleOAuth,
  completeOAuth,
  performLogout,
  performForgotPassword,
  performResetPassword,
  performResendVerification,
  performConfirmEmail,
  requireAuth,
  requireAnon,
};
