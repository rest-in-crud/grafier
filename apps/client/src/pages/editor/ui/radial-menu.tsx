import type { ReactNode } from 'react';
import { useState } from 'react';
import type { IconProps } from '../types';
import { IDuplicate, ICut, IPaste, IStar, IPin, ITrash } from '../icons';

const RADIAL_ITEMS: { id: string; label: string; Icon: (p: IconProps) => ReactNode }[] = [
  { id: 'copy', label: 'Copy', Icon: IDuplicate },
  { id: 'cut', label: 'Cut', Icon: ICut },
  { id: 'paste', label: 'Paste', Icon: IPaste },
  { id: 'star', label: 'Favorite', Icon: IStar },
  { id: 'pin', label: 'Pin', Icon: IPin },
  { id: 'trash', label: 'Delete', Icon: ITrash },
];

type RadialMenuProps = { x: number; y: number; onClose: () => void };

export function RadialMenu({ x, y, onClose }: RadialMenuProps) {
  const [hover, setHover] = useState<number | null>(null);
  const cx = 120,
    cy = 120;
  const rOuter = 105,
    rInner = 48;
  const segs = RADIAL_ITEMS.length;
  const arcOffset = -Math.PI / 2 - Math.PI / segs;

  function segPath(i: number) {
    const a0 = arcOffset + (i / segs) * Math.PI * 2;
    const a1 = arcOffset + ((i + 1) / segs) * Math.PI * 2;
    const x0o = cx + Math.cos(a0) * rOuter,
      y0o = cy + Math.sin(a0) * rOuter;
    const x1o = cx + Math.cos(a1) * rOuter,
      y1o = cy + Math.sin(a1) * rOuter;
    const x0i = cx + Math.cos(a0) * rInner,
      y0i = cy + Math.sin(a0) * rInner;
    const x1i = cx + Math.cos(a1) * rInner,
      y1i = cy + Math.sin(a1) * rInner;
    return `M ${x0o} ${y0o} A ${rOuter} ${rOuter} 0 0 1 ${x1o} ${y1o} L ${x1i} ${y1i} A ${rInner} ${rInner} 0 0 0 ${x0i} ${y0i} Z`;
  }

  function iconPos(i: number) {
    const a = arcOffset + ((i + 0.5) / segs) * Math.PI * 2;
    const r = (rOuter + rInner) / 2;
    return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r };
  }

  return (
    <div
      className="fixed inset-0 z-100"
      onClick={onClose}
      onContextMenu={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <div
        className="radial-container"
        style={{ left: x, top: y }}
        onClick={(e) => e.stopPropagation()}
      >
        <svg
          width="240"
          height="240"
          viewBox="0 0 240 240"
          className="absolute inset-0 pointer-events-auto overflow-visible"
        >
          <circle
            cx={cx}
            cy={cy}
            r={rOuter + 10}
            fill="none"
            stroke="rgba(255,255,255,0.10)"
            strokeWidth="1"
            strokeDasharray="2 4"
          />
          {RADIAL_ITEMS.map((it, i) => (
            <path
              key={it.id}
              className={`radial-segment${hover === i ? ' selected' : ''}`}
              d={segPath(i)}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              onClick={onClose}
            />
          ))}
          <circle
            cx={cx}
            cy={cy}
            r={rInner - 2}
            fill="#050505"
            stroke="rgba(255,255,255,0.18)"
            strokeWidth="1"
          />
          <circle cx={cx} cy={cy} r="2" fill="var(--fg-dim)" />
          {RADIAL_ITEMS.map((it, i) => {
            const p = iconPos(i);
            return (
              <g
                key={`i-${it.id}`}
                className="pointer-events-none text-foreground"
                transform={`translate(${p.x - 8}, ${p.y - 8})`}
              >
                <it.Icon size={16} />
              </g>
            );
          })}
        </svg>
        {hover !== null && <div className="radial-label">{RADIAL_ITEMS[hover].label}</div>}
      </div>
    </div>
  );
}
