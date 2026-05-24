import { useEffect } from 'react';
import type { RefObject } from 'react';
import type { Canvas } from 'fabric';
import type { CanvasEngine } from '@/features/canvas/lib/CanvasEngine';
import { useCanvasStore } from '@/features/canvas/store/canvas.store';
import { useReadOnlyStore } from '@/features/projects/store/read-only.store';
import { isPrimaryModifier } from '@/shared/lib/platform';

const collectAllIds = (canvas: Canvas): string[] =>
  canvas
    .getObjects()
    .map((o) => (typeof o.data?.id === 'string' ? o.data.id : null))
    .filter((id): id is string => id !== null);

export function useEditorShortcuts(engineRef: RefObject<CanvasEngine | null>) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPrimaryModifier(e) && e.code === 'KeyS' && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        return;
      }

      if (useReadOnlyStore.getState().isReadOnly) return;

      const tag = (document.activeElement?.tagName ?? '').toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;
      const canvas = engineRef.current?.fabricCanvas;
      if (!canvas) return;

      if (e.key === 'Escape') {
        if (useCanvasStore.getState().activeTool === 'shape') return;
        canvas.discardActiveObject();
        canvas.requestRenderAll();
        return;
      }

      if (!isPrimaryModifier(e)) return;
      if (e.shiftKey || e.altKey) return;

      if (e.code === 'KeyD') {
        e.preventDefault();
        useCanvasStore.getState().duplicateSelection();
        return;
      }

      if (e.code === 'KeyA') {
        e.preventDefault();
        useCanvasStore.getState().selectObjectsByIds(collectAllIds(canvas));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [engineRef]);
}
