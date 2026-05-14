import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/shared/ui/button';

const STEPS = [
  'INITIATING OAUTH HANDSHAKE',
  'VERIFYING PROVIDER SIGNATURE',
  'NEGOTIATING WORKSPACE TOKEN',
  'LOADING YOUR CANVAS',
];

const STEP_MS = 400;
const REDIRECT_DELAY_MS = 600;

const CallbackPage = () => {
  const navigate = useNavigate();
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (idx >= STEPS.length) return;
    const timer = setTimeout(() => setIdx((i) => i + 1), STEP_MS);
    return () => clearTimeout(timer);
  }, [idx]);

  useEffect(() => {
    if (idx < STEPS.length) return;
    const timer = setTimeout(() => navigate('/signin'), REDIRECT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [idx, navigate]);

  const allDone = idx >= STEPS.length;

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
        {STEPS.map((step, i) => {
          const state = i < idx ? 'done' : i === idx ? 'active' : 'pending';
          const prefix = state === 'done' ? '[✓]' : state === 'active' ? '[»]' : '[ ]';
          const tone = state === 'pending' ? 'text-muted-foreground/60' : 'text-foreground';
          return (
            <div key={step} className={tone}>
              {prefix} {step}
              {state === 'active' && (
                <span
                  aria-hidden
                  className="ml-0.75 inline-block h-[11px] w-1.75 -translate-y-px bg-foreground animate-blink"
                />
              )}
            </div>
          );
        })}
        {allDone && <div className="mt-1 text-foreground">[✓] READY · REDIRECTING</div>}
      </div>

      <Button variant="ghost" onClick={() => navigate('/signin')}>
        Cancel
      </Button>
    </div>
  );
};

export { CallbackPage };
