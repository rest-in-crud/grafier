import type { FC } from 'react';
import { useCanvasStore } from '@/features/canvas/store/canvas.store';
import { useSaveStatusStore, type SaveStatus } from '@/features/projects/store/save-status.store';
import { Slider } from './primitives/slider';

const labelFor = (status: SaveStatus): string => {
  switch (status.tag) {
    case 'idle':
      return 'Saved';
    case 'dirty':
      return 'Unsaved';
    case 'saving':
      return 'Saving…';
    case 'error':
      return status.lastError.status === 0
        ? 'No connection · changes unsaved'
        : 'Save failed · try again';
    case 'fatal':
      switch (status.reason) {
        case 'not-found':
          return 'Project deleted · autosave off';
        case 'forbidden':
          return 'Access denied · autosave off';
        case 'too-large':
          return 'Design too large · autosave off';
      }
  }
};

type StatusBarProps = {
  cursor: { x: number; y: number };
};

const StatusBar: FC<StatusBarProps> = ({ cursor }) => {
  const zoom = useCanvasStore((s) => s.zoom);
  const setZoom = useCanvasStore((s) => s.setZoom);
  const status = useSaveStatusStore((s) => s.status);
  const px = cursor.x.toString().padStart(4, '0');
  const py = cursor.y.toString().padStart(4, '0');

  return (
    <div className="flex h-full items-center gap-3.5 border-t border-hairline bg-background px-3.5 font-mono text-[10px] uppercase tracking-[0.14em] text-fg-dim">
      <span>{`GRAFIER · V${__APP_VERSION__}`}</span>
      <span className="h-3 w-px bg-hairline" />
      <span>
        {px} × {py} PX
      </span>
      <span className="h-3 w-px bg-hairline" />
      <span>{labelFor(status)}</span>
      <div className="mr-10 ml-auto flex items-center gap-3.5">
        <span>ZOOM</span>
        <Slider value={zoom} onChange={setZoom} min={10} max={400} suffix="%" />
      </div>
    </div>
  );
};

export { StatusBar };
