import { redirect } from 'react-router';
import { api } from '@/features/auth/api';
import { setAccessToken, clearAccessToken } from '@/features/auth/token';
import { queryClient } from '@/shared/lib/query-client';
import { userQueryKey } from '@/features/auth/query-keys';
import { userQueryOptions } from '@/features/auth/queries';
import { safeRedirect } from '@/shared/lib/safe-redirect';
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
  const params = new URLSearchParams(window.location.search);
  const desired = safeRedirect(params.get('redirect'));
  const url = desired
    ? `${base}/auth/google?state=${encodeURIComponent(desired)}`
    : `${base}/auth/google`;
  window.location.href = url;
};

const completeOAuth = async () => {
  try {
    await queryClient.fetchQuery(userQueryOptions);
  } catch {
    throw redirect('/signin?error=oauth');
  }
  const params = new URLSearchParams(window.location.search);
  const target = safeRedirect(params.get('redirect'));
  throw redirect(target ?? '/');
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

const performUpdateName = async (id: string, name: string): Promise<void> => {
  await api.updateName(id, name);
  await queryClient.invalidateQueries({ queryKey: userQueryKey });
};

const performChangePassword = async (
  id: string,
  oldPassword: string,
  newPassword: string,
): Promise<void> => {
  await api.changePassword(id, oldPassword, newPassword);
};

const performInitiateEmailChange = async (id: string, email: string): Promise<void> => {
  await api.initiateEmailChange(id, email);
  await queryClient.invalidateQueries({ queryKey: userQueryKey });
};

const performDeleteAccount = async (id: string): Promise<void> => {
  await api.deleteUser(id);
  performLogout();
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
  performUpdateName,
  performChangePassword,
  performInitiateEmailChange,
  performDeleteAccount,
};
