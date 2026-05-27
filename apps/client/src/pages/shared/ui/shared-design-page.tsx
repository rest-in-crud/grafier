import { Link, useNavigate, useParams } from 'react-router';
import { useSharedDesign, useForkAsProject } from '@/features/projects/queries';
import { useUser } from '@/features/auth/queries';
import { HttpError } from '@/shared/lib/api-client';
import { Button } from '@/shared/ui/button';
import { useNoticeStore } from '@/features/notice/store/notice.store';
import { SharedCanvas } from './shared-canvas';
import { SharedNotFound } from './shared-not-found';

const SharedDesignPage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { data: design, isPending, error } = useSharedDesign(token ?? '');
  const { user } = useUser();
  const fork = useForkAsProject();

  if (isPending) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-chrome">
        <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-fg-dim">
          Loading…
        </div>
      </div>
    );
  }

  if (error instanceof HttpError && error.status === 404) {
    return <SharedNotFound />;
  }

  if (error || !design) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-chrome">
        <div className="flex max-w-sm flex-col gap-3 border border-hairline-strong bg-background p-6 text-center">
          <h1 className="font-sans text-lg text-foreground">Could not load this design</h1>
          <p className="font-sans text-sm text-fg-dim">Refresh to try again.</p>
        </div>
      </div>
    );
  }

  const onFork = async () => {
    try {
      const created = await fork.mutateAsync({ id: design.id, token: token ?? undefined });
      navigate(`/editor/${created.id}`);
    } catch {
      useNoticeStore.getState().show('Could not fork this design');
    }
  };

  const signInTarget = `/signin?redirect=${encodeURIComponent(`/p/${token ?? ''}`)}`;

  return (
    <div className="flex h-svh flex-col bg-chrome">
      <header className="flex h-12 items-center gap-3.5 border-b border-hairline bg-chrome px-3">
        <Link
          to="/"
          className="flex h-full items-center border-r border-hairline pr-3.5 font-mono text-[11px] font-semibold tracking-[0.28em] text-foreground hover:text-foreground"
        >
          GRAFIER
        </Link>
        <div className="flex flex-1 items-center justify-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-fg-dim">
          <span className="max-w-[40ch] truncate text-foreground" title={design.name}>
            {design.name}
          </span>
          <span>·</span>
          <span>by @{design.userName}</span>
        </div>
        <div className="flex h-full items-center gap-3">
          {user ? (
            user.id === design.userID ? (
              <Button asChild size="sm">
                <Link to={`/editor/${design.id}`}>Go to project</Link>
              </Button>
            ) : (
              <Button size="sm" onClick={onFork} disabled={fork.isPending}>
                {fork.isPending ? 'Opening…' : 'Open in Grafier'}
              </Button>
            )
          ) : (
            <Button asChild size="sm">
              <Link to={signInTarget}>Sign in to fork</Link>
            </Button>
          )}
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-fg-dim">
            Created with Grafier
          </span>
        </div>
      </header>
      <div className="relative flex min-h-0 flex-1 overflow-hidden p-6">
        <SharedCanvas design={design} />
      </div>
    </div>
  );
};

export { SharedDesignPage };
