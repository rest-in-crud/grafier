import { Link } from 'react-router';
import { Button } from '@/shared/ui/button';

const SharedNotFound = () => (
  <div className="flex min-h-svh items-center justify-center bg-chrome">
    <div className="flex max-w-sm flex-col gap-4 border border-hairline-strong bg-background p-6 text-center">
      <h1 className="font-sans text-lg text-foreground">This link is no longer active</h1>
      <p className="font-sans text-sm text-fg-dim">
        The owner may have revoked it, or the link is incorrect.
      </p>
      <Button asChild size="sm" className="mx-auto">
        <Link to="/">Go to Grafier</Link>
      </Button>
    </div>
  </div>
);

export { SharedNotFound };
