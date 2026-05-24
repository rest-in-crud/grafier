import { useEffect, useState } from 'react';
import { useCanvasStore } from '@/features/canvas/store/canvas.store';

export function PickToast() {
  const toast = useCanvasStore((s) => s.toast);
  const hideToast = useCanvasStore((s) => s.hideToast);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!toast) return;
    const raf = requestAnimationFrame(() => setShow(true));
    const fadeOut = setTimeout(() => setShow(false), 1700);
    const hide = setTimeout(hideToast, 2000);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(fadeOut);
      clearTimeout(hide);
    };
  }, [toast, hideToast]);

  if (!toast) return null;

  return (
    <div
      className={`pointer-events-none fixed bottom-10 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 border border-hairline bg-raised px-3 py-1.5 transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0'}`}
    >
      <div
        className="size-3 shrink-0 border border-hairline-strong"
        style={{ backgroundColor: toast.message }}
      />
      <span className="font-mono text-[10px] tracking-[0.1em] text-foreground">
        {toast.message}
      </span>
    </div>
  );
}
