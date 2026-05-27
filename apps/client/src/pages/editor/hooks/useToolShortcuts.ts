import { useEffect } from 'react';
import type { ToolId } from '../types';
import { useCanvasStore } from '@/features/canvas/store/canvas.store';
import { useReadOnlyStore } from '@/features/projects/store/read-only.store';

const SHORTCUT_MAP: Record<string, ToolId> = {
  KeyV: 'move',
  KeyB: 'brush',
  KeyP: 'pencil',
  KeyE: 'eraser',
  KeyG: 'fill',
  KeyU: 'shape',
  KeyT: 'text',
  KeyI: 'image',
  KeyD: 'dropper',
  KeyH: 'hand',
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
