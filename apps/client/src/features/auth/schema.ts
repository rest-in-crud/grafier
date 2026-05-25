import { z } from 'zod';

const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  provider: z.string().nullable(),
  pendingEmail: z.string().email().nullable().optional(),
});

const signInSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

const signUpSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z.string().trim().toLowerCase().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const authResponseSchema = z.object({
  accessToken: z.string(),
  user: userSchema,
});

const refreshResponseSchema = z.object({
  accessToken: z.string(),
});

const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email'),
});

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

const verifyEmailSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email'),
});

const meResponseSchema = z.object({ user: userSchema });

type User = z.infer<typeof userSchema>;
type SignInValues = z.infer<typeof signInSchema>;
type SignUpValues = z.infer<typeof signUpSchema>;
type AuthResponse = z.infer<typeof authResponseSchema>;
type RefreshResponse = z.infer<typeof refreshResponseSchema>;
type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
type VerifyEmailValues = z.infer<typeof verifyEmailSchema>;
type MeResponse = z.infer<typeof meResponseSchema>;

export {
  userSchema,
  signInSchema,
  signUpSchema,
  authResponseSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  refreshResponseSchema,
  meResponseSchema,
};
export type {
  User,
  SignInValues,
  SignUpValues,
  AuthResponse,
  RefreshResponse,
  ForgotPasswordValues,
  ResetPasswordValues,
  VerifyEmailValues,
  MeResponse,
};
