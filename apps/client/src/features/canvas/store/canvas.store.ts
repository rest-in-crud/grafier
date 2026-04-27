import { create } from 'zustand';

interface CanvasState {
  activeTool: string
  setActiveTool: (tool: string) => void

  toolStyles: Record<string, Record<string, unknown>>
  setToolStyle: (toolId: string, patch: Record<string, unknown>) => void
}

export const useCanvasStore = create<CanvasState>((set) => ({
  activeTool: 'select',
  setActiveTool: (tool) => set({ activeTool: tool }),

  toolStyles: {},
  setToolStyle: (toolId, patch) => set((state) => ({
    toolStyles: {
      ...state.toolStyles,
      [toolId]: { ...state.toolStyles[toolId], ...patch },
    }
  })),
}))
