import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useSearchParams } from 'react-router';
import { ArrowRightIcon } from '@phosphor-icons/react';
import { signInSchema, type SignInValues } from '@/features/auth/schema';
import { performSignIn, startGoogleOAuth } from '@/features/auth/session';
import { HttpError } from '@/shared/lib/api-client';
import { Button } from '@/shared/ui/button';
import { Field } from '@/shared/ui/field';
import { GoogleIcon } from '@/shared/ui/google-icon';
import { Input } from '@/shared/ui/input';
import { PasswordInput } from '@/shared/ui/password-input';

const SignInForm = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const { register, handleSubmit, setError, clearErrors, formState } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
  });

  useEffect(() => {
    if (searchParams.get('error') === 'oauth') {
      setError('root.serverError', {
        message: 'Google sign-in failed. Please try again.',
      });
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setError, setSearchParams]);

  const onSubmit = async (values: SignInValues) => {
    clearErrors('root.serverError');
    try {
      await performSignIn(values);
      navigate('/');
    } catch (error) {
      if (error instanceof HttpError && error.status === 401) {
        setError('root.serverError', { message: 'Invalid credentials' });
        setError('email', { type: 'manual' });
        setError('password', { type: 'manual' });
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

      <Field
        label="PASSWORD"
        error={formState.errors.password?.message}
        invalid={!!formState.errors.password}
      >
        <PasswordInput
          {...register('password')}
          autoComplete="current-password"
          placeholder="••••••••••••"
        />
      </Field>

      <Button
        type="submit"
        disabled={formState.isSubmitting}
        className="mt-2 w-full justify-center gap-2"
      >
        {formState.isSubmitting ? (
          'Signing in…'
        ) : (
          <>
            Enter workspace
            <ArrowRightIcon weight="bold" aria-hidden="true" />
          </>
        )}
      </Button>

      <div className="flex items-center gap-3 font-mono text-2xs uppercase tracking-mono text-muted-foreground">
        <span className="h-px flex-1 bg-hairline" />
        <span>or</span>
        <span className="h-px flex-1 bg-hairline" />
      </div>

      <Button
        type="button"
        variant="ghost"
        onClick={startGoogleOAuth}
        className="w-full justify-center gap-2"
      >
        <GoogleIcon />
        Continue with Google
      </Button>
    </form>
  );
};

export { SignInForm };
