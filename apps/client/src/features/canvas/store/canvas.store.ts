import { create } from 'zustand';
import type { ToolId } from '@/pages/editor/types';

interface CanvasState {
  activeTool: ToolId;
  setActiveTool: (tool: ToolId) => void;
}

export const useCanvasStore = create<CanvasState>((set) => ({
  activeTool: 'move',
  setActiveTool: (tool) => set({ activeTool: tool }),
}));
