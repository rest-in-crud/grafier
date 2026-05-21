import { useEffect, useRef } from 'react';
import { CanvasEngine } from '@/features/canvas/lib/CanvasEngine';

export const useCanvas = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<CanvasEngine | null>(null);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    const containerEl = containerRef.current;
    if (!canvasEl || !containerEl) return;

    let disposed = false;
    const { width, height } = containerEl.getBoundingClientRect();
    const engine = new CanvasEngine(canvasEl, { width, height });
    engineRef.current = engine;

    const observer = new ResizeObserver(([entry]) => {
      if (disposed) return;
      const { width, height } = entry.contentRect;
      engine.resize(width, height);
    });
    observer.observe(containerEl);

    return () => {
      disposed = true;
      observer.disconnect();
      engineRef.current = null;
      void engine.destroy();
    };
  }, []);

  return { containerRef, canvasRef, engineRef };
};
