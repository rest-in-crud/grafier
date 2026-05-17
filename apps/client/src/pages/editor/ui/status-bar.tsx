import type { FC } from 'react';
import { Slider } from './primitives/slider';

type StatusBarProps = {
  cursor: { x: number; y: number };
  zoom: number;
  setZoom: (v: number) => void;
};

const StatusBar: FC<StatusBarProps> = ({ cursor, zoom, setZoom }) => {
  const px = cursor.x.toString().padStart(4, '0');
  const py = cursor.y.toString().padStart(4, '0');

  return (
    <div className="flex h-full items-center gap-3.5 border-t border-hairline bg-background px-3.5 font-mono text-[10px] uppercase tracking-[0.14em] text-fg-dim">
      <span>GRAFIER · V1.0</span>
      <span className="h-3 w-px bg-hairline" />
      <span>
        {px} × {py} PX
      </span>
      <span className="h-3 w-px bg-hairline" />
      <span>RGB / 8</span>
      <span className="h-3 w-px bg-hairline" />
      <span>SAVED · 14:22</span>
      <div className="ml-auto flex items-center gap-3.5">
        <span>ZOOM</span>
        <Slider value={zoom} onChange={setZoom} min={10} max={400} suffix="%" />
      </div>
    </div>
  );
};

export { StatusBar };
