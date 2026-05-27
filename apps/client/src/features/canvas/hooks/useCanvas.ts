import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { CanvasEngine } from '@/features/canvas/lib/CanvasEngine';

export const useCanvas = (
  engineRef: RefObject<CanvasEngine | null>,
  artboardWidth: number,
  artboardHeight: number,
) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;

    const engine = new CanvasEngine(canvasEl, {
      width: artboardWidth,
      height: artboardHeight,
    });
    engineRef.current = engine;

    return () => {
      engineRef.current = null;
      void engine.destroy();
    };
  }, [engineRef, artboardWidth, artboardHeight]);

  return { canvasRef };
};
