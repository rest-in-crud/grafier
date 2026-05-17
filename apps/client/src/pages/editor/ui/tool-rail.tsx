import { useState } from 'react';
import type { ReactNode } from 'react';
import type { IconProps, ToolId } from '../types';
import { ToolButton } from './primitives';
import {
  IMove,
  IMarquee,
  ILasso,
  IBrush,
  IPencil,
  IEraser,
  IShape,
  IText,
  IDropper,
  IHand,
  IZoom,
} from '../icons';

type DividerEntry = { _div: true };

type ToolEntry = {
  id: ToolId;
  name: string;
  kbd: string;
  Icon: (p: IconProps) => ReactNode;
};
type ToolsEntry = DividerEntry | ToolEntry;

type TooltipState = {
  id: ToolId;
  name: string;
  kbd: string;
  x: number;
  y: number;
} | null;

const TOOLS: ToolsEntry[] = [
  { id: 'move', name: 'Move', kbd: 'V', Icon: IMove },
  { id: 'marquee', name: 'Marquee', kbd: 'M', Icon: IMarquee },
  { id: 'lasso', name: 'Lasso', kbd: 'L', Icon: ILasso },
  { _div: true },
  { id: 'brush', name: 'Brush', kbd: 'B', Icon: IBrush },
  { id: 'pencil', name: 'Pencil', kbd: 'P', Icon: IPencil },
  { id: 'eraser', name: 'Eraser', kbd: 'E', Icon: IEraser },
  { _div: true },
  { id: 'shape', name: 'Shape', kbd: 'U', Icon: IShape },
  { id: 'text', name: 'Text', kbd: 'T', Icon: IText },
  { id: 'dropper', name: 'Eyedropper', kbd: 'I', Icon: IDropper },
  { _div: true },
  { id: 'hand', name: 'Hand', kbd: 'H', Icon: IHand },
  { id: 'zoom', name: 'Zoom', kbd: 'Z', Icon: IZoom },
];

export function ToolRail({
  active,
  setActive,
}: {
  active: ToolId;
  setActive: (id: ToolId) => void;
}) {
  const [hover, setHover] = useState<TooltipState>(null);

  return (
    <div className="flex flex-col items-center gap-0.5 overflow-x-hidden overflow-y-auto border-r border-hairline bg-chrome py-2">
      {TOOLS.map((t, i) =>
        '_div' in t ? (
          <div key={i} className="my-1 h-px w-6 bg-hairline" />
        ) : (
          <ToolButton
            key={t.id}
            active={active === t.id}
            onClick={() => setActive(t.id)}
            onMouseEnter={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              setHover({
                id: t.id,
                name: t.name,
                kbd: t.kbd,
                x: r.right + 6,
                y: r.top + r.height / 2,
              });
            }}
            onMouseLeave={() => setHover((h) => (h && h.id === t.id ? null : h))}
            ariaLabel={t.name}
          >
            <t.Icon />
          </ToolButton>
        ),
      )}
      {hover && (
        <span
          className="font-mono pointer-events-none fixed z-30 whitespace-nowrap border border-hairline-strong bg-raised px-2 py-1 text-[10px] tracking-[0.12em] text-foreground"
          style={{ left: hover.x, top: hover.y, transform: 'translateY(-50%)' }}
        >
          {hover.name}
          <span className="ml-2 text-muted-foreground">{hover.kbd}</span>
        </span>
      )}
    </div>
  );
}
