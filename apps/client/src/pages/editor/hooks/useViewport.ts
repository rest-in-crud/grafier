import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { Point } from 'fabric';
import type { CanvasEngine } from '@/features/canvas/lib/CanvasEngine';
import { useCanvasStore } from '@/features/canvas/store/canvas.store';

const MIN_ZOOM = 10;
const MAX_ZOOM = 400;
const ZOOM_STEP = 1.1;

export function useViewport(
  wrapperRef: RefObject<HTMLDivElement | null>,
  engineRef: RefObject<CanvasEngine | null>,
) {
  const isSpacePressed = useRef(false);
  const isPanning = useRef(false);
  const panStart = useRef<{ x: number; y: number; vt: number[] } | null>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const getCanvas = () => engineRef.current?.fabricCanvas ?? null;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (isPanning.current) return;
      const canvas = getCanvas();
      if (!canvas) return;

      if (e.ctrlKey || e.metaKey) {
        const rect = wrapper.getBoundingClientRect();
        const pointer = new Point(e.clientX - rect.left, e.clientY - rect.top);
        const current = useCanvasStore.getState().zoom;
        const factor = e.deltaY < 0 ? ZOOM_STEP : 1 / ZOOM_STEP;
        const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, current * factor));
        useCanvasStore.getState().zoomToPoint(next, pointer);
        return;
      }

      const current = canvas.viewportTransform;
      if (!current) return;
      const next: typeof current = [...current];
      if (e.shiftKey) {
        next[4] -= e.deltaY;
      } else {
        next[5] -= e.deltaY;
        if (e.deltaX) next[4] -= e.deltaX;
      }
      canvas.setViewportTransform(next);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return;
      const tag = (document.activeElement?.tagName ?? '').toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;
      e.preventDefault();
      if (!isSpacePressed.current) {
        isSpacePressed.current = true;
        const canvas = getCanvas();
        if (canvas) canvas.defaultCursor = 'grab';
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return;
      isSpacePressed.current = false;
      isPanning.current = false;
      panStart.current = null;
      const canvas = getCanvas();
      if (canvas) canvas.defaultCursor = 'default';
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (!isSpacePressed.current) return;
      const canvas = getCanvas();
      if (!canvas?.viewportTransform) return;
      isPanning.current = true;
      panStart.current = {
        x: e.clientX,
        y: e.clientY,
        vt: [...canvas.viewportTransform],
      };
      canvas.defaultCursor = 'grabbing';
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isPanning.current || !panStart.current) return;
      const canvas = getCanvas();
      if (!canvas) return;
      const dx = e.clientX - panStart.current.x;
      const dy = e.clientY - panStart.current.y;
      const vt = [...panStart.current.vt];
      vt[4] += dx;
      vt[5] += dy;
      canvas.setViewportTransform(vt);
    };

    const handleMouseUp = () => {
      if (!isPanning.current) return;
      isPanning.current = false;
      panStart.current = null;
      const canvas = getCanvas();
      if (canvas) canvas.defaultCursor = isSpacePressed.current ? 'grab' : 'default';
    };

    const handleBlur = () => {
      isSpacePressed.current = false;
      isPanning.current = false;
      panStart.current = null;
      const canvas = getCanvas();
      if (canvas) canvas.defaultCursor = 'default';
    };

    wrapper.addEventListener('wheel', handleWheel, { passive: false });
    wrapper.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      wrapper.removeEventListener('wheel', handleWheel);
      wrapper.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [wrapperRef, engineRef]);
}
