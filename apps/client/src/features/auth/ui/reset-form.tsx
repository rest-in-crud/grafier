import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { resetPasswordSchema, type ResetPasswordValues } from '@/features/auth/schema';
import { performResetPassword } from '@/features/auth/session';
import { HttpError } from '@/shared/lib/api-client';
import { Button } from '@/shared/ui/button';
import { Field } from '@/shared/ui/field';
import { PasswordInput } from '@/shared/ui/password-input';

const ResetForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [linkInvalid, setLinkInvalid] = useState(false);

  const { register, handleSubmit, setError, clearErrors, formState } = useForm<ResetPasswordValues>(
    {
      resolver: zodResolver(resetPasswordSchema),
    },
  );

  const onSubmit = async (values: ResetPasswordValues) => {
    if (!token) return;
    clearErrors('root.serverError');
    try {
      await performResetPassword(token, values);
      navigate('/signin?reset=success', { replace: true });
    } catch (error) {
      if (error instanceof HttpError && error.status === 401) {
        setLinkInvalid(true);
      } else {
        setError('root.serverError', { message: 'Something went wrong. Try again.' });
      }
    }
  };

  if (!token || linkInvalid) {
    return (
      <div role="status" className="max-w-[36ch] text-body text-muted-foreground">
        This password reset link is invalid or has expired.{' '}
        <Link to="/forgot" className="text-foreground underline-offset-2 hover:underline">
          Request a new link
        </Link>
        .
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

      <Field
        label="NEW PASSWORD"
        error={formState.errors.password?.message}
        invalid={!!formState.errors.password}
      >
        <PasswordInput
          {...register('password')}
          autoComplete="new-password"
          placeholder="••••••••••••"
        />
      </Field>

      <Field
        label="CONFIRM PASSWORD"
        error={formState.errors.confirmPassword?.message}
        invalid={!!formState.errors.confirmPassword}
      >
        <PasswordInput
          {...register('confirmPassword')}
          autoComplete="new-password"
          placeholder="••••••••••••"
        />
      </Field>

      <Button
        type="submit"
        disabled={formState.isSubmitting}
        className="mt-2 w-full justify-center gap-2"
      >
        {formState.isSubmitting ? 'Resetting…' : 'Set new password'}
      </Button>
    </form>
  );
};

export { ResetForm };
