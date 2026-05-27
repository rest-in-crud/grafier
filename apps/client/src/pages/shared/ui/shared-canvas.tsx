import { useEffect, useRef, useState } from 'react';
import { Canvas } from 'fabric';
import type { SharedDesign } from '@/features/projects/schema';

type SharedCanvasProps = {
  design: SharedDesign;
};

const SharedCanvas = ({ design }: SharedCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const outerRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const outer = outerRef.current;
    if (!outer) return;
    const parent = outer.parentElement;
    if (!parent) return;

    const compute = () => {
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      if (w <= 0 || h <= 0) return;
      setScale(Math.min(w / design.width, h / design.height, 1));
    };

    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(parent);
    return () => ro.disconnect();
  }, [design.width, design.height]);

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
      ref={outerRef}
      className="border border-hairline-strong"
      style={{
        width: Math.round(design.width * scale),
        height: Math.round(design.height * scale),
      }}
    >
      <div
        style={{
          width: design.width,
          height: design.height,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};

export { SharedCanvas };
