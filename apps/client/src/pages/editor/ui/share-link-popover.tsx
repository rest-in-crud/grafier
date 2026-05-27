import { useEffect, useRef, useState } from 'react';
import type { SVGProps } from 'react';
import { XLogoIcon, LinkedinLogoIcon, FacebookLogoIcon } from '@phosphor-icons/react';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { Button } from '@/shared/ui/button';
import { useProject, useCreateShareToken, useRevokeShareToken } from '@/features/projects/queries';
import { useNoticeStore } from '@/features/notice/store/notice.store';

type ShareLinkPopoverProps = {
  designId: string;
};

const ShareIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.25"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <path d="M9.25 3.5l1-1a2.65 2.65 0 0 1 3.75 3.75l-2.25 2.25a2.65 2.65 0 0 1-3.75 0" />
    <path d="M6.75 12.5l-1 1a2.65 2.65 0 0 1-3.75-3.75l2.25-2.25a2.65 2.65 0 0 1 3.75 0" />
    <path d="M6.25 9.75l3.5-3.5" />
  </svg>
);

const buildShareUrl = (token: string): string => `${window.location.origin}/p/${token}`;

const buildSocialShares = (url: string, title: string) => {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  return {
    x: `https://twitter.com/intent/tweet?url=${u}&text=${t}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
  };
};

const socialBtn =
  'flex size-7 cursor-pointer items-center justify-center border border-hairline-strong text-fg-dim transition-colors hover:border-foreground hover:text-foreground';

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
  const socials = buildSocialShares(shareUrl, `${design.name} on Grafier`);

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
        <button
          type="button"
          aria-label="Share"
          title="Share"
          className="flex cursor-pointer items-center text-fg-dim transition-colors hover:text-foreground"
        >
          <ShareIcon className="size-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="center" className="w-80">
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
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <a
                  href={socials.x}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label="Share on X"
                  title="Share on X"
                  className={socialBtn}
                >
                  <XLogoIcon size={14} />
                </a>
                <a
                  href={socials.linkedin}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label="Share on LinkedIn"
                  title="Share on LinkedIn"
                  className={socialBtn}
                >
                  <LinkedinLogoIcon size={14} />
                </a>
                <a
                  href={socials.facebook}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label="Share on Facebook"
                  title="Share on Facebook"
                  className={socialBtn}
                >
                  <FacebookLogoIcon size={14} />
                </a>
              </div>
              <Button size="sm" onClick={onCopy}>
                {copiedAt ? 'Copied' : 'Copy link'}
              </Button>
            </div>
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={onRevoke} disabled={revokeShare.isPending}>
                {revokeShare.isPending ? 'Revoking…' : 'Revoke link'}
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
