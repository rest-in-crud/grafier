import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import type { CanvasEngine } from '@/features/canvas/lib/CanvasEngine';
import type { BaseTool } from '@/features/canvas/lib/tools/BaseTool';
import { useCanvasStore } from '@/features/canvas/store/canvas.store';
import { isPrimaryModifier } from '@/shared/lib/platform';
import { ToolRegistry } from '@/features/canvas/lib/tools/ToolRegistry';
import type { ToolId } from '@/pages/editor/types';

type Snapshot = {
  toolId: ToolId;
  tool: BaseTool | null;
  isDrawingMode: boolean;
  selection: boolean;
  hoverCursor: string;
};

export function useTempMoveOverride(engineRef: RefObject<CanvasEngine | null>) {
  const activeRef = useRef(false);
  const snapshotRef = useRef<Snapshot | null>(null);
  const modifierHeldRef = useRef(false);
  const mouseDownRef = useRef(false);

  useEffect(() => {
    const enterOverride = () => {
      if (activeRef.current) return;
      if (mouseDownRef.current) return;
      const canvas = engineRef.current?.fabricCanvas;
      if (!canvas) return;

      const toolId = useCanvasStore.getState().activeTool;
      if (toolId === 'move') return;
      const tool = ToolRegistry.get(toolId);

      snapshotRef.current = {
        toolId,
        tool,
        isDrawingMode: canvas.isDrawingMode,
        selection: canvas.selection,
        hoverCursor: canvas.hoverCursor,
      };
      tool?.suspend?.(canvas);
      canvas.isDrawingMode = false;
      canvas.selection = true;
      canvas.hoverCursor = 'move';
      activeRef.current = true;
    };

    const exitOverride = () => {
      const canvas = engineRef.current?.fabricCanvas;
      const snap = snapshotRef.current;
      activeRef.current = false;
      snapshotRef.current = null;
      if (!canvas || !snap) return;
      // If the tool was permanently changed during the override (e.g. paste switched
      // to move), skip the canvas restore — the engine already applied the new tool.
      if (useCanvasStore.getState().activeTool !== snap.toolId) return;
      snap.tool?.resume?.(canvas);
      canvas.isDrawingMode = snap.isDrawingMode;
      canvas.selection = snap.selection;
      canvas.hoverCursor = snap.hoverCursor;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (!isPrimaryModifier(e)) return;
      const tag = (document.activeElement?.tagName ?? '').toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;
      modifierHeldRef.current = true;
      enterOverride();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (isPrimaryModifier(e)) return;
      modifierHeldRef.current = false;
      if (!mouseDownRef.current) exitOverride();
    };

    const handleMouseDown = () => {
      mouseDownRef.current = true;
    };

    const handleMouseUp = () => {
      mouseDownRef.current = false;
      if (!modifierHeldRef.current && activeRef.current) exitOverride();
    };

    const handleBlur = () => {
      modifierHeldRef.current = false;
      mouseDownRef.current = false;
      if (activeRef.current) exitOverride();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [engineRef]);
}
