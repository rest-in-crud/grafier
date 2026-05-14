import { useNavigate } from 'react-router';
import { performLogout } from '@/features/auth/session';
import { useAuthStore } from '@/features/auth/store';
import { AsciiBackground } from '@/shared/ui/ascii-background';
import { Button } from '@/shared/ui/button';

const EditorPage = () => {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const onLogout = async () => {
    await performLogout();
    navigate('/signin');
  };

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
        <div className="flex max-w-140 flex-col items-center gap-7 text-center">
          <div className="flex items-center gap-3 self-stretch font-mono text-2xs uppercase tracking-mono text-muted-foreground">
            <span className="h-px flex-1 bg-hairline" />
            <span>Workspace</span>
            <span className="h-px flex-1 bg-hairline" />
          </div>

          <h1 className="text-display font-medium tracking-tight">
            Welcome{user?.name ? `, ${user.name}` : ''}.
          </h1>

          <p className="max-w-[44ch] text-body text-muted-foreground">
            The editor is coming in v0.2. For now, the auth loop is fully wired.
          </p>

          <Button variant="ghost" onClick={onLogout}>
            Log out
          </Button>
        </div>
      </main>
    </div>
  );
};

export { EditorPage };
