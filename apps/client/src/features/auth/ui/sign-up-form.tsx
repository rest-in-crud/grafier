import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router';
import { ArrowRightIcon } from '@phosphor-icons/react';
import { signUpSchema, type SignUpValues } from '@/features/auth/schema';
import { performSignUp } from '@/features/auth/session';
import { HttpError } from '@/shared/lib/api-client';
import { Button } from '@/shared/ui/button';
import { Field } from '@/shared/ui/field';
import { Input } from '@/shared/ui/input';
import { PasswordInput } from '@/shared/ui/password-input';

const SignUpForm = () => {
  const navigate = useNavigate();

  const { register, handleSubmit, setError, clearErrors, formState } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (values: SignUpValues) => {
    clearErrors('root.serverError');
    try {
      await performSignUp(values);
      navigate('/');
    } catch (error) {
      if (error instanceof HttpError && error.status === 409) {
        setError('root.serverError', { message: 'Email is already taken.' });
        setError('email', { type: 'manual' });
      } else {
        setError('root.serverError', { message: 'Something went wrong. Try again.' });
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-busy={formState.isSubmitting}
      className="flex flex-col gap-4"
    >
      {formState.errors.root?.serverError && (
        <div role="alert" className="font-mono text-2xs uppercase tracking-mono text-destructive">
          {formState.errors.root.serverError.message}
        </div>
      )}

      <Field label="NAME" error={formState.errors.name?.message}>
        <Input
          {...register('name')}
          type="text"
          autoComplete="name"
          placeholder="Your name"
          autoCapitalize="words"
        />
      </Field>

      <Field
        label="EMAIL"
        error={formState.errors.email?.message}
        invalid={!!formState.errors.email}
      >
        <Input
          {...register('email')}
          type="email"
          autoComplete="email"
          placeholder="you@studio.com"
        />
      </Field>

      <Field label="PASSWORD" error={formState.errors.password?.message}>
        <PasswordInput
          {...register('password')}
          autoComplete="new-password"
          placeholder="••••••••••••"
        />
      </Field>

      <Button
        type="submit"
        disabled={formState.isSubmitting}
        className="mt-2 w-full justify-center gap-2"
      >
        {formState.isSubmitting ? (
          'Creating account…'
        ) : (
          <>
            Create account
            <ArrowRightIcon weight="bold" aria-hidden="true" />
          </>
        )}
      </Button>
    </form>
  );
};

export { SignUpForm };
