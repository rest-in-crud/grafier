import type { DragEvent, MouseEvent, ReactNode } from 'react';
import { useCanvasStore } from '@/features/canvas/store/canvas.store';
import { CursorOverlay } from '@/features/canvas/components/CursorOverlay';

const SIZING_TOOLS = new Set<string>(['pencil', 'brush', 'eraser']);

type CanvasStageProps = {
  onContextMenu: (e: MouseEvent) => void;
  onMouseMove: (e: MouseEvent) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onDragOver?: (e: DragEvent) => void;
  onDrop?: (e: DragEvent) => void;
  cursorPos: { x: number; y: number };
  cursorVisible: boolean;
  children?: ReactNode;
};

export function CanvasStage({
  onContextMenu,
  onMouseMove,
  onMouseEnter,
  onMouseLeave,
  onDragOver,
  onDrop,
  cursorPos,
  cursorVisible,
  children,
}: CanvasStageProps) {
  const activeTool = useCanvasStore((s) => s.activeTool);
  const hideCursor = SIZING_TOOLS.has(activeTool);

  return (
    <div
      className="canvas-stage-bg relative size-full overflow-hidden"
      style={hideCursor ? { cursor: 'none' } : undefined}
      onContextMenu={onContextMenu}
      onMouseMove={onMouseMove}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div className="absolute top-0 left-0 z-5 h-4.5 w-4.5 border-r border-b border-hairline bg-background" />
      <div className="absolute top-0 left-4.5 right-0 z-4 h-4.5 border-b border-hairline bg-background pointer-events-none select-none" />
      <div className="absolute top-4.5 left-0 bottom-0 z-4 w-4.5 border-r border-hairline bg-background pointer-events-none select-none" />
      <div className="absolute top-4.5 right-0 bottom-0 left-4.5">{children}</div>
      {cursorVisible && hideCursor && <CursorOverlay x={cursorPos.x} y={cursorPos.y} />}
    </div>
  );
}
