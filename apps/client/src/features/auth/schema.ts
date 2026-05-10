import { z } from 'zod';

const signInSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  provider: z.string().nullable(),
});

type SignInValues = z.infer<typeof signInSchema>;
type User = z.infer<typeof userSchema>;

export { signInSchema, userSchema };
export type { SignInValues, User };
