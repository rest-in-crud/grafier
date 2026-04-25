import { create } from 'zustand';

interface CanvasState {
  activeTool: string;
  setActiveTool: (tool: string) => void;
}

export const useCanvasStore = create<CanvasState>((set) => ({
  activeTool: 'select',
  setActiveTool: (tool) => set({ activeTool: tool }),
}));
