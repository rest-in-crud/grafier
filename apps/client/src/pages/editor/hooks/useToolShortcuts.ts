import { useEffect } from 'react';
import type { ToolId } from '../types';
import { useCanvasStore } from '@/features/canvas/store/canvas.store';

const SHORTCUT_MAP: Record<string, ToolId> = {
  V: 'move',
  M: 'marquee',
  L: 'lasso',
  B: 'brush',
  P: 'pencil',
  E: 'eraser',
  U: 'shape',
  T: 'text',
  I: 'dropper',
  H: 'hand',
  Z: 'zoom',
};

export function useToolShortcuts() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return;
      const tag = (document.activeElement?.tagName ?? '').toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;

      const toolId = SHORTCUT_MAP[e.key.toUpperCase()];
      if (toolId) useCanvasStore.getState().setActiveTool(toolId);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
