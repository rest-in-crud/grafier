import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { performConfirmEmail, performLogout } from '@/features/auth/session';
import { HttpError } from '@/shared/lib/api-client';
import { Button } from '@/shared/ui/button';

type Status = 'idle' | 'confirming' | 'invalid';

const VerifyForm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<Status>(token ? 'idle' : 'invalid');
  const [error, setError] = useState<string | null>(null);

  const onConfirm = async () => {
    if (!token) return;
    setError(null);
    setStatus('confirming');
    try {
      await performConfirmEmail(token);
      performLogout();
      navigate('/signin', { replace: true });
    } catch (err) {
      if (err instanceof HttpError && err.status === 401) {
        setStatus('invalid');
      } else {
        setStatus('idle');
        setError('Something went wrong. Try again.');
      }
    }
  };

  if (status === 'invalid') {
    return (
      <div role="status" className="max-w-[36ch] text-body text-muted-foreground">
        This verification link is invalid or has expired. Sign in to request a new one.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="max-w-[36ch] text-body text-muted-foreground">
        Click below to confirm the email address for your account.
      </p>

      {error && (
        <div role="alert" className="font-mono text-2xs uppercase tracking-mono text-destructive">
          {error}
        </div>
      )}

      <Button
        type="button"
        onClick={onConfirm}
        disabled={status === 'confirming'}
        className="w-full justify-center gap-2"
      >
        {status === 'confirming' ? 'Confirming…' : 'Confirm my email address'}
      </Button>
    </div>
  );
};

export { VerifyForm };
