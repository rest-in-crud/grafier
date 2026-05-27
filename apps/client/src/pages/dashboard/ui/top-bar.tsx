import { Link } from 'react-router';
import { useUser } from '@/features/auth/queries';
import { performLogout } from '@/features/auth/session';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';

const TopBar = () => {
  const { user } = useUser();
  const firstName = (user?.name ?? user?.email ?? '').split(/[ @]/)[0] || 'Friend';

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-hairline bg-background/80 px-10 py-4 backdrop-blur">
      <Link
        to="/"
        className="font-mono text-xs font-semibold uppercase tracking-[0.3em] text-foreground"
      >
        GRAFIER
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex cursor-pointer items-center gap-2.5 border border-hairline-strong bg-white/[0.02] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-foreground hover:border-foreground"
          >
            {firstName}
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="min-w-44">
          <DropdownMenuLabel className="font-mono text-[10px] uppercase tracking-[0.14em] text-fg-dim">
            {user?.email}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/settings">Settings</Link>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => performLogout()}>Log out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};

export { TopBar };
