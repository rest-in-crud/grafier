import { useEffect } from 'react';
import { useNoticeStore } from '@/features/notice/store/notice.store';

const HOLD_MS = 3000;

const NoticeBanner = () => {
  const current = useNoticeStore((s) => s.current);
  const dismiss = useNoticeStore((s) => s.dismiss);

  useEffect(() => {
    if (!current) return;
    const timer = setTimeout(() => dismiss(), HOLD_MS);
    return () => clearTimeout(timer);
  }, [current, dismiss]);

  if (!current) return null;

  return (
    <button
      type="button"
      onClick={() => dismiss()}
      className="pointer-events-auto fixed top-24 left-1/2 z-30 -translate-x-1/2 cursor-pointer border border-hairline-strong bg-raised px-3 py-1.5 font-mono text-[11px] tracking-[0.16em] text-foreground uppercase opacity-100 transition-opacity duration-150"
      aria-live="polite"
    >
      {current.message}
    </button>
  );
};

export { NoticeBanner };
