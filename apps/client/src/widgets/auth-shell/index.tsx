import { Link, Outlet } from 'react-router';
import { ScreenBackground } from '@/shared/ui/screen-background';

const AuthShell = () => {
  return (
    <div className="fixed inset-0 overflow-hidden bg-background">
      <ScreenBackground />

      <header className="pointer-events-none fixed inset-x-0 top-0 z-20 flex items-center justify-between px-7 py-4">
        <Link
          to="/"
          className="pointer-events-auto font-mono text-xs font-semibold uppercase tracking-[0.3em] text-foreground hover:text-foreground"
        >
          Grafier
        </Link>
      </header>

      <main className="relative z-10 flex h-full items-center justify-center overflow-y-auto px-8 py-24">
        <Outlet />
      </main>
    </div>
  );
};

export { AuthShell };
