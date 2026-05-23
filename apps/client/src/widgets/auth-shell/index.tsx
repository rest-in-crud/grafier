import { Outlet } from 'react-router';
import { ScreenBackground } from '@/shared/ui/screen-background';

const AuthShell = () => {
  return (
    <div className="fixed inset-0 overflow-hidden bg-background">
      <ScreenBackground />

      <header className="pointer-events-none fixed inset-x-0 top-0 z-20 flex items-center justify-between px-7 py-4">
        <span className="font-mono text-xs font-semibold uppercase tracking-[0.3em] text-foreground">
          Grafier
        </span>
      </header>

      <main className="relative z-10 flex h-full items-center justify-center overflow-y-auto px-8 py-24">
        <Outlet />
      </main>
    </div>
  );
};

export { AuthShell };
