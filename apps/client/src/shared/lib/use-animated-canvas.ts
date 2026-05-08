import { useEffect, useRef } from 'react';

type Renderer = (
  ctx: CanvasRenderingContext2D,
  params: { time: number; width: number; height: number },
) => void;

const useAnimatedCanvas = (renderer: Renderer) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef(renderer);
  rendererRef.current = renderer;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let width = 0;
    let height = 0;
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const start = performance.now();

    const tick = (now: number) => {
      const time = (now - start) / 1000;
      ctx.clearRect(0, 0, width, height);
      ctx.save();
      rendererRef.current(ctx, { time, width, height });
      ctx.restore();
      raf = requestAnimationFrame(tick);
    };

    if (!mql.matches) raf = requestAnimationFrame(tick);

    const onMotionChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        cancelAnimationFrame(raf);
        ctx.clearRect(0, 0, width, height);
      } else {
        raf = requestAnimationFrame(tick);
      }
    };
    mql.addEventListener('change', onMotionChange);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      mql.removeEventListener('change', onMotionChange);
    };
  }, []);

  return ref;
};

export { useAnimatedCanvas };
export type { Renderer };
