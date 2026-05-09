import { create } from 'zustand';
import type { ShapeType } from '@/features/canvas/lib/shapes/shape.config.ts';

interface CanvasState {
  activeTool: string
  setActiveTool: (tool: string) => void

  activeShape: ShapeType | null
  setActiveShape: (shape: ShapeType | null) => void

  toolStyles: Record<string, Record<string, unknown>>
  setToolStyle: (toolId: string, patch: Record<string, unknown>) => void
}

export const useCanvasStore = create<CanvasState>((set) => ({
  activeTool: 'select',
  setActiveTool: (tool) => set({ activeTool: tool }),

  activeShape: 'rect',
  setActiveShape: (shape) => set({ activeShape: shape }),

  toolStyles: {},
  setToolStyle: (toolId, patch) => set((state) => ({
    toolStyles: {
      ...state.toolStyles,
      [toolId]: { ...state.toolStyles[toolId], ...patch },
    }
  })),
}))
