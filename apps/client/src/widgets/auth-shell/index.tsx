import { Outlet } from 'react-router';

const AuthShell = () => {
  return (
    <div className="relative min-h-screen bg-background">
      <header className="absolute left-6 top-6 font-mono text-2xs uppercase tracking-mono text-muted-foreground">
        Grafier
      </header>
      <main className="grid min-h-screen place-items-center">
        <Outlet />
      </main>
    </div>
  );
};

export { AuthShell };