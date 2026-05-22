import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import type { CanvasEngine } from '@/features/canvas/lib/CanvasEngine';
import { useCanvasStore } from '@/features/canvas/store/canvas.store';
import { isPrimaryModifier } from '@/shared/lib/platform';
import { ToolRegistry } from '@/features/canvas/lib/tools/ToolRegistry';

type Snapshot = {
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
      if (!canvas || !snap) {
        activeRef.current = false;
        snapshotRef.current = null;
        return;
      }
      const toolId = useCanvasStore.getState().activeTool;
      const tool = ToolRegistry.get(toolId);
      tool?.resume?.(canvas);
      canvas.isDrawingMode = snap.isDrawingMode;
      canvas.selection = snap.selection;
      canvas.hoverCursor = snap.hoverCursor;
      activeRef.current = false;
      snapshotRef.current = null;
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

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [engineRef]);
}
