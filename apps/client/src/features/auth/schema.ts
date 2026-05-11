import { z } from 'zod';

const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  provider: z.string().nullable(),
});

const signInSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

const authResponseSchema = z.object({
  accessToken: z.string(),
  user: userSchema,
});

const refreshResponseSchema = z.object({
  accessToken: z.string(),
});

type User = z.infer<typeof userSchema>;
type SignInValues = z.infer<typeof signInSchema>;
type AuthResponse = z.infer<typeof authResponseSchema>;
type RefreshResponse = z.infer<typeof refreshResponseSchema>;

export { userSchema, signInSchema, authResponseSchema, refreshResponseSchema };
export type { User, SignInValues, AuthResponse, RefreshResponse };
