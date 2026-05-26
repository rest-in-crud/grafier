import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRightIcon } from '@phosphor-icons/react';
import { signUpSchema, type SignUpValues } from '@/features/auth/schema';
import { performSignUp, startGoogleOAuth } from '@/features/auth/session';
import { HttpError } from '@/shared/lib/api-client';
import { ResendVerification } from '@/features/auth/ui/resend-verification';
import { Button } from '@/shared/ui/button';
import { Field } from '@/shared/ui/field';
import { GoogleIcon } from '@/shared/ui/google-icon';
import { Input } from '@/shared/ui/input';
import { PasswordInput } from '@/shared/ui/password-input';
import { PasswordStrength } from '@/shared/ui/password-strength';

const SignUpForm = () => {
  const [sentEmail, setSentEmail] = useState<string | null>(null);

  const { register, handleSubmit, setError, clearErrors, control, formState } =
    useForm<SignUpValues>({
      resolver: zodResolver(signUpSchema),
    });
  const passwordValue = useWatch({ control, name: 'password', defaultValue: '' });

  const onSubmit = async (values: SignUpValues) => {
    clearErrors('root.serverError');
    try {
      await performSignUp(values);
      setSentEmail(values.email);
    } catch (error) {
      if (error instanceof HttpError && error.status === 409) {
        setError('root.serverError', { message: 'Email is already taken.' });
        setError('email', { type: 'manual' });
      } else {
        setError('root.serverError', { message: 'Something went wrong. Try again.' });
      }
    }
  };

  if (sentEmail) {
    return (
      <div className="flex max-w-[36ch] flex-col gap-4">
        <p role="status" className="text-body text-muted-foreground">
          Check your email, we sent a verification link to {sentEmail}.
        </p>

        <ResendVerification email={sentEmail} />
      </div>
    );
  }

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
        <PasswordStrength value={passwordValue} />
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

export { SignUpForm };
