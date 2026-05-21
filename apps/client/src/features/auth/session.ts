import { redirect } from 'react-router';
import { api } from '@/features/auth/api';
import { setAccessToken, clearAccessToken } from '@/features/auth/token';
import { queryClient } from '@/shared/lib/query-client';
import { userQueryKey } from '@/features/auth/query-keys';
import { userQueryOptions } from '@/features/auth/queries';
import type {
  AuthResponse,
  ForgotPasswordValues,
  ResetPasswordValues,
  SignInValues,
  SignUpValues,
  VerifyEmailValues,
} from '@/features/auth/schema';

const performSignIn = async (values: SignInValues): Promise<AuthResponse> => {
  const result = await api.signIn(values);
  setAccessToken(result.accessToken);
  queryClient.setQueryData(userQueryKey, result.user);
  return result;
};

const performSignUp = async (values: SignUpValues): Promise<void> => {
  await api.signUp(values);
};

const startGoogleOAuth = () => {
  const base = (import.meta.env.VITE_URL_BACKEND ?? '/api').replace(/\/$/, '');
  window.location.href = `${base}/auth/google`;
};

const completeOAuth = async () => {
  try {
    await queryClient.fetchQuery(userQueryOptions);
  } catch {
    throw redirect('/signin?error=oauth');
  }
  throw redirect('/');
};

const performLogout = () => {
  clearAccessToken();
  queryClient.setQueryData(userQueryKey, null);
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

export {
  performSignIn,
  performSignUp,
  startGoogleOAuth,
  completeOAuth,
  performLogout,
  performForgotPassword,
  performResetPassword,
  performResendVerification,
  performConfirmEmail,
};
