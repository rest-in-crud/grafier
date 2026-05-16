import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, type ForgotPasswordValues } from '@/features/auth/schema';
import { performForgotPassword } from '@/features/auth/session';
import { Button } from '@/shared/ui/button';
import { Field } from '@/shared/ui/field';
import { Input } from '@/shared/ui/input';

const ForgotForm = () => {
  const [submitted, setSubmitted] = useState(false);

  const { register, handleSubmit, setError, clearErrors, formState } =
    useForm<ForgotPasswordValues>({
      resolver: zodResolver(forgotPasswordSchema),
    });

  const onSubmit = async (values: ForgotPasswordValues) => {
    clearErrors('root.serverError');
    try {
      await performForgotPassword(values);
      setSubmitted(true);
    } catch {
      setError('root.serverError', { message: 'Something went wrong. Try again.' });
    }
  };

  if (submitted) {
    return (
      <div role="status" className="max-w-[36ch] text-body text-muted-foreground">
        If an account exists for that email, a reset link is on its way.
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

      <Button
        type="submit"
        disabled={formState.isSubmitting}
        className="mt-2 w-full justify-center gap-2"
      >
        {formState.isSubmitting ? 'Sending…' : 'Send reset link'}
      </Button>
    </form>
  );
};

export { ForgotForm };
