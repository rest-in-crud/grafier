import { Link, useNavigate } from 'react-router';
import { ArrowLeftIcon, ArrowRightIcon, HouseIcon } from '@phosphor-icons/react';
import { AsciiBackground } from '@/shared/ui/ascii-background';
import { Button } from '@/shared/ui/button';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 overflow-hidden bg-background">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-shell-glow" />
      <AsciiBackground />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-shell-grid" />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-shell-vignette" />

      <header className="pointer-events-none fixed inset-x-0 top-0 z-20 flex items-center justify-between px-7 py-4">
        <span className="font-mono text-xs font-semibold uppercase tracking-[0.3em] text-foreground">
          Grafier
        </span>
      </header>

      <main className="relative z-10 flex h-full items-center justify-center overflow-y-auto px-8 py-24">
        <div className="flex max-w-140 flex-col items-center gap-8 text-center">
          <div className="flex items-center gap-3 font-mono text-2xs uppercase tracking-mono text-muted-foreground">
            <span className="size-1.25 rounded-full bg-destructive shadow-glow-destructive" />
            <span>ERR · 404 · UNKNOWN ROUTE</span>
          </div>

          <div className="text-[128px] leading-none font-bold tracking-tighter md:text-[220px]">
            404
          </div>

          <h1 className="text-display font-medium tracking-tight">This canvas doesn't exist.</h1>

          <p className="max-w-[44ch] text-body text-muted-foreground">
            The page you're looking for might have been moved, renamed, or was never drawn in the
            first place.
          </p>

          <div className="mt-2 flex gap-3">
            <Button variant="ghost" onClick={() => navigate(-1)}>
              <ArrowLeftIcon weight="bold" aria-hidden="true" />
              Go back
            </Button>
            <Button asChild>
              <Link to="/">
                <HouseIcon weight="bold" aria-hidden="true" />
                Go home
                <ArrowRightIcon weight="bold" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export { NotFoundPage };
