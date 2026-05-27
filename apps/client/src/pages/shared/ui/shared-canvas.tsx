import { useCallback, useEffect, useRef, useState } from 'react';
import { Canvas } from 'fabric';
import type { SharedDesign } from '@/features/projects/schema';

type SharedCanvasProps = {
  design: SharedDesign;
};

const MIN_SCALE = 0.05;
const MAX_SCALE = 8;
const ZOOM_STEP = 1.1;
const CLAMP_MARGIN = 80;

type Transform = { scale: number; tx: number; ty: number };

const SharedCanvas = ({ design }: SharedCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const transformRef = useRef<Transform>({ scale: 1, tx: 0, ty: 0 });
  const [transform, setTransform] = useState<Transform>({ scale: 1, tx: 0, ty: 0 });
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    transformRef.current = transform;
  }, [transform]);

  const clamp = useCallback(
    (next: Transform): Transform => {
      const v = viewportRef.current;
      if (!v) return next;
      const vw = v.clientWidth;
      const vh = v.clientHeight;
      const scaledW = design.width * next.scale;
      const scaledH = design.height * next.scale;
      return {
        scale: next.scale,
        tx: Math.min(vw - CLAMP_MARGIN, Math.max(CLAMP_MARGIN - scaledW, next.tx)),
        ty: Math.min(vh - CLAMP_MARGIN, Math.max(CLAMP_MARGIN - scaledH, next.ty)),
      };
    },
    [design.width, design.height],
  );

  useEffect(() => {
    const v = viewportRef.current;
    if (!v) return;
    let initialized = false;
    const compute = () => {
      const vw = v.clientWidth;
      const vh = v.clientHeight;
      if (vw <= 0 || vh <= 0) return;
      if (!initialized) {
        const fit = Math.min(vw / design.width, vh / design.height, 1);
        setTransform({
          scale: fit,
          tx: (vw - design.width * fit) / 2,
          ty: (vh - design.height * fit) / 2,
        });
        initialized = true;
        return;
      }
      setTransform((t) => clamp(t));
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(v);
    return () => ro.disconnect();
  }, [design.width, design.height, clamp]);

  useEffect(() => {
    const v = viewportRef.current;
    if (!v) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = v.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      setTransform((t) => {
        if (e.ctrlKey || e.metaKey) {
          const factor = e.deltaY < 0 ? ZOOM_STEP : 1 / ZOOM_STEP;
          const nextScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, t.scale * factor));
          const wx = (cx - t.tx) / t.scale;
          const wy = (cy - t.ty) / t.scale;
          return clamp({
            scale: nextScale,
            tx: cx - wx * nextScale,
            ty: cy - wy * nextScale,
          });
        }
        if (e.shiftKey) {
          return clamp({ ...t, tx: t.tx - e.deltaY });
        }
        return clamp({
          ...t,
          tx: t.tx - e.deltaX,
          ty: t.ty - e.deltaY,
        });
      });
    };
    v.addEventListener('wheel', onWheel, { passive: false, capture: true });
    return () => v.removeEventListener('wheel', onWheel, { capture: true });
  }, [clamp]);

  useEffect(() => {
    const v = viewportRef.current;
    if (!v) return;
    let active = false;
    let startX = 0;
    let startY = 0;
    let startTx = 0;
    let startTy = 0;

    const onDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      active = true;
      setIsDragging(true);
      startX = e.clientX;
      startY = e.clientY;
      startTx = transformRef.current.tx;
      startTy = transformRef.current.ty;
    };
    const onMove = (e: MouseEvent) => {
      if (!active) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      setTransform(
        clamp({ scale: transformRef.current.scale, tx: startTx + dx, ty: startTy + dy }),
      );
    };
    const onUp = () => {
      if (!active) return;
      active = false;
      setIsDragging(false);
    };

    v.addEventListener('mousedown', onDown, { capture: true });
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      v.removeEventListener('mousedown', onDown, { capture: true });
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [clamp]);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el || !design.canvasJSON) return;

    const canvas = new Canvas(el, {
      width: design.width,
      height: design.height,
      selection: false,
      backgroundColor: '#ffffff',
    });
    canvas.skipTargetFind = true;

    let cancelled = false;
    void canvas.loadFromJSON(design.canvasJSON).then(() => {
      if (cancelled) return;
      for (const obj of canvas.getObjects()) {
        obj.selectable = false;
        obj.evented = false;
      }
      canvas.renderAll();
    });

    return () => {
      cancelled = true;
      void canvas.dispose();
    };
  }, [design.canvasJSON, design.width, design.height]);

  if (!design.canvasJSON) {
    return (
      <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-fg-dim">
        This design is empty
      </div>
    );
  }

  return (
    <div
      ref={viewportRef}
      className="relative h-full w-full overflow-hidden"
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      <div
        className="absolute top-0 left-0 border border-hairline-strong"
        style={{
          width: design.width,
          height: design.height,
          transform: `translate(${transform.tx}px, ${transform.ty}px) scale(${transform.scale})`,
          transformOrigin: 'top left',
        }}
      >
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};

export { SharedCanvas };
