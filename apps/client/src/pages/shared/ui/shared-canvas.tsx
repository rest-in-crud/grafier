import { useEffect, useRef } from 'react';
import { Canvas } from 'fabric';
import type { SharedDesign } from '@/features/projects/schema';

type SharedCanvasProps = {
  design: SharedDesign;
};

const SharedCanvas = ({ design }: SharedCanvasProps) => {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const el = ref.current;
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

  return <canvas ref={ref} className="border border-hairline-strong" />;
};

export { SharedCanvas };
