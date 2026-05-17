import type { MouseEvent } from 'react';

type CanvasArtProps = {
  selected: boolean;
};

function CanvasArt({ selected }: CanvasArtProps) {
  return (
    <svg viewBox="0 0 800 520" preserveAspectRatio="xMidYMid meet">
      <rect x="0" y="0" width="800" height="520" fill="#f5f3ee" />
      <rect x="80" y="60" width="640" height="400" fill="#0f0f0f" />
      <circle cx="180" cy="160" r="28" fill="none" stroke="#f2f2f2" strokeWidth="1.5" />
      <circle cx="180" cy="160" r="6" fill="#f2f2f2" />
      <text
        x="220"
        y="168"
        fill="#f2f2f2"
        fontFamily="Inter"
        fontSize="22"
        fontWeight="600"
        letterSpacing="2"
      >
        GRAFIER
      </text>
      <text x="80" y="510" fill="#0f0f0f" fontFamily="Inter" fontSize="11" letterSpacing="3">
        A GRAPHIC EDITOR FOR EVERYONE · ESTD 2026
      </text>
      <text
        x="80"
        y="320"
        fill="#f2f2f2"
        fontFamily="Inter"
        fontSize="68"
        fontWeight="500"
        letterSpacing="-1"
      >
        Draw it.
      </text>
      <text
        x="80"
        y="390"
        fill="#f2f2f2"
        fontFamily="Inter"
        fontSize="68"
        fontWeight="500"
        letterSpacing="-1"
      >
        Ship it.
      </text>
      <g transform="translate(620, 380)" stroke="#f2f2f2" strokeWidth="1" fill="none">
        <polygon points="0,-40 35,-20 35,20 0,40 -35,20 -35,-20" />
        <polygon points="0,-24 21,-12 21,12 0,24 -21,12 -21,-12" />
        <circle cx="0" cy="0" r="3" fill="#f2f2f2" />
      </g>
      {selected && (
        <g>
          <rect
            x="80"
            y="60"
            width="640"
            height="400"
            fill="none"
            stroke="#fff"
            strokeWidth="1"
            strokeDasharray="4 3"
          />
          {[
            [80, 60],
            [400, 60],
            [720, 60],
            [80, 260],
            [720, 260],
            [80, 460],
            [400, 460],
            [720, 460],
          ].map(([x, y], i) => (
            <rect key={i} x={x - 4} y={y - 4} width="8" height="8" fill="#fff" stroke="#000" />
          ))}
        </g>
      )}
    </svg>
  );
}

type CanvasStageProps = {
  selected: boolean;
  zoom: number;
  onContextMenu: (e: MouseEvent) => void;
  onMouseMove: (e: MouseEvent) => void;
};

export function CanvasStage({ selected, zoom, onContextMenu, onMouseMove }: CanvasStageProps) {
  return (
    <div
      className="canvas-stage-bg relative flex items-center justify-center overflow-hidden"
      onContextMenu={onContextMenu}
      onMouseMove={onMouseMove}
    >
      <div className="absolute top-0 left-0 z-5 h-4.5 w-4.5 border-r border-b border-hairline bg-background" />
      <div className="absolute top-0 left-4.5 right-0 z-4 h-4.5 border-b border-hairline bg-background pointer-events-none select-none" />
      <div className="absolute top-4.5 left-0 bottom-0 z-4 w-4.5 border-r border-hairline bg-background pointer-events-none select-none" />
      <div
        className="canvas-doc-bg relative h-130 w-200 overflow-hidden"
        style={{
          transform: `scale(${zoom / 100})`,
          boxShadow:
            '0 0 0 1px var(--hairline-strong), 0 30px 80px rgba(0,0,0,0.6), 0 8px 30px rgba(0,0,0,0.4)',
        }}
      >
        <CanvasArt selected={selected} />
      </div>
    </div>
  );
}
