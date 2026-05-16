import { useEffect, useState } from 'react';
import { performResendVerification } from '@/features/auth/session';
import { Button } from '@/shared/ui/button';

type Status = 'idle' | 'sending' | 'sent';

const RESEND_COOLDOWN_MS = 30_000;

const ResendVerification = ({ email }: { email: string }) => {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status !== 'sent') return;
    const timer = setTimeout(() => setStatus('idle'), RESEND_COOLDOWN_MS);
    return () => clearTimeout(timer);
  }, [status]);

  const onResend = async () => {
    setError(null);
    setStatus('sending');
    try {
      await performResendVerification({ email });
      setStatus('sent');
    } catch {
      setStatus('idle');
      setError('Something went wrong. Try again.');
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {error && (
        <div role="alert" className="font-mono text-2xs uppercase tracking-mono text-destructive">
          {error}
        </div>
      )}
      {status === 'sent' && (
        <div role="status" className="text-body text-muted-foreground">
          Verification email sent. Check your inbox.
        </div>
      )}
      <Button
        type="button"
        variant="ghost"
        onClick={onResend}
        disabled={status !== 'idle'}
        className="w-full justify-center"
      >
        {status === 'sending'
          ? 'Resending…'
          : status === 'sent'
            ? 'Verification email sent'
            : 'Resend verification email'}
      </Button>
    </div>
  );
};

export { ResendVerification };
