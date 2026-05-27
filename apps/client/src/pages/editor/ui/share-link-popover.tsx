import { useEffect, useRef, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { Button } from '@/shared/ui/button';
import { useProject, useCreateShareToken, useRevokeShareToken } from '@/features/projects/queries';
import { useNoticeStore } from '@/features/notice/store/notice.store';

type ShareLinkPopoverProps = {
  designId: string;
};

const buildShareUrl = (token: string): string => `${window.location.origin}/p/${token}`;

const ShareLinkPopover = ({ designId }: ShareLinkPopoverProps) => {
  const { data: design } = useProject(designId);
  const createShare = useCreateShareToken(designId);
  const revokeShare = useRevokeShareToken(designId);
  const [open, setOpen] = useState(false);
  const [copiedAt, setCopiedAt] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!copiedAt) return;
    const timer = setTimeout(() => setCopiedAt(null), 2000);
    return () => clearTimeout(timer);
  }, [copiedAt]);

  if (!design) return null;

  const shareToken = design.shareToken ?? null;
  const shareUrl = shareToken ? buildShareUrl(shareToken) : '';

  const onCreate = async () => {
    try {
      await createShare.mutateAsync();
    } catch {
      useNoticeStore.getState().show('Could not create share link');
    }
  };

  const onRevoke = async () => {
    try {
      await revokeShare.mutateAsync();
    } catch {
      useNoticeStore.getState().show('Could not revoke share link');
    }
  };

  const onCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedAt(Date.now());
    } catch {
      inputRef.current?.select();
      useNoticeStore.getState().show('Copy failed; press Ctrl+C');
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm">
          Share
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        {shareToken ? (
          <div className="flex flex-col gap-3">
            <label className="font-mono text-[11px] uppercase tracking-[0.16em] text-fg-dim">
              Anyone with this link can view
            </label>
            <input
              ref={inputRef}
              type="text"
              value={shareUrl}
              readOnly
              aria-label="Share link URL"
              onFocus={(e) => e.target.select()}
              className="border border-hairline-strong bg-background px-2 py-1.5 font-mono text-[11px] text-foreground outline-none focus:border-foreground"
            />
            <div className="flex justify-between gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={onRevoke}
                disabled={revokeShare.isPending}
              >
                {revokeShare.isPending ? 'Revoking…' : 'Revoke'}
              </Button>
              <Button size="sm" onClick={onCopy}>
                {copiedAt ? 'Copied' : 'Copy link'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="font-sans text-sm text-foreground">
              Create a link that anyone can use to view this design without making it public.
            </p>
            <div className="flex justify-end">
              <Button size="sm" onClick={onCreate} disabled={createShare.isPending}>
                {createShare.isPending ? 'Creating…' : 'Create share link'}
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export { ShareLinkPopover };
