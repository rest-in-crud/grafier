import { useNavigate } from 'react-router';
import { Button } from '@/shared/ui/button';

const STEPS = [
  'INITIATING OAUTH HANDSHAKE',
  'VERIFYING PROVIDER SIGNATURE',
  'NEGOTIATING WORKSPACE TOKEN',
  'LOADING YOUR CANVAS',
];

const CallbackPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex w-full max-w-105 flex-col items-center gap-7 text-center">
      <div className="flex items-center gap-3 self-stretch font-mono text-2xs uppercase tracking-mono text-muted-foreground">
        <span className="h-px flex-1 bg-hairline" />
        <span>Authorization</span>
        <span className="h-px flex-1 bg-hairline" />
      </div>

      <div className="relative size-24">
        <div aria-hidden className="absolute inset-0 rounded-full border border-hairline-strong" />
        <div
          aria-hidden
          className="absolute inset-0 animate-spin rounded-full border border-transparent border-t-foreground"
        />
        <div className="absolute inset-7 flex items-center justify-center border border-hairline font-mono text-lg">
          G
        </div>
      </div>

      <h1 className="text-display font-medium tracking-tight">Signing you in…</h1>

      <p className="max-w-[36ch] text-body text-muted-foreground">
        Completing the secure handshake. This takes a moment.
      </p>

      <div
        role="status"
        className="w-full self-stretch border border-hairline bg-background/55 px-4 py-3.5 text-left font-mono text-[11px] text-muted-foreground"
      >
        {STEPS.map((step) => (
          <div key={step} className="text-foreground">
            [»] {step}
          </div>
        ))}
      </div>

      <Button variant="ghost" onClick={() => navigate('/signin')}>
        Cancel
      </Button>
    </div>
  );
};

export { CallbackPage };
