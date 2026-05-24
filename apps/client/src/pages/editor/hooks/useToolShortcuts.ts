import { useEffect } from 'react';
import type { ToolId } from '../types';
import { useCanvasStore } from '@/features/canvas/store/canvas.store';
import { useReadOnlyStore } from '@/features/projects/store/read-only.store';

const SHORTCUT_MAP: Record<string, ToolId> = {
  KeyV: 'move',
  KeyM: 'marquee',
  KeyL: 'lasso',
  KeyB: 'brush',
  KeyP: 'pencil',
  KeyE: 'eraser',
  KeyU: 'shape',
  KeyT: 'text',
  KeyI: 'dropper',
  KeyH: 'hand',
  KeyZ: 'zoom',
};

export function useToolShortcuts() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (useReadOnlyStore.getState().isReadOnly) return;
      if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return;
      const tag = (document.activeElement?.tagName ?? '').toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;

      const toolId = SHORTCUT_MAP[e.code];
      if (toolId) useCanvasStore.getState().setActiveTool(toolId);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
