import { useEffect, useRef } from 'react';
import { CanvasEngine } from '@/features/canvas/lib/CanvasEngine.ts';
import { useCanvasStore } from '@/features/canvas/store/canvas.store.ts';

export const useCanvas = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<CanvasEngine | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const { width, height } = containerRef.current.getBoundingClientRect();

    engineRef.current = new CanvasEngine(canvasRef.current, { width, height });
    useCanvasStore.getState().setEngineRef(engineRef);

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      engineRef.current?.resize(width, height);
    });

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      engineRef.current?.destroy();
      engineRef.current = null;
    };
  }, []);

  return { containerRef, canvasRef, engineRef };
};