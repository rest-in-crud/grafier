import type { MouseEvent, ReactNode } from 'react';

type CanvasStageProps = {
  onContextMenu: (e: MouseEvent) => void;
  onMouseMove: (e: MouseEvent) => void;
  children?: ReactNode;
};

export function CanvasStage({ onContextMenu, onMouseMove, children }: CanvasStageProps) {
  return (
    <div
      className="canvas-stage-bg relative overflow-hidden"
      onContextMenu={onContextMenu}
      onMouseMove={onMouseMove}
    >
      <div className="absolute top-0 left-0 z-5 h-4.5 w-4.5 border-r border-b border-hairline bg-background" />
      <div className="absolute top-0 left-4.5 right-0 z-4 h-4.5 border-b border-hairline bg-background pointer-events-none select-none" />
      <div className="absolute top-4.5 left-0 bottom-0 z-4 w-4.5 border-r border-hairline bg-background pointer-events-none select-none" />
      <div className="absolute top-4.5 right-0 bottom-0 left-4.5">{children}</div>
    </div>
  );
}
