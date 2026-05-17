import { create } from 'zustand';
import { CanvasEngine } from "@/features/canvas/lib/CanvasEngine.ts";
import { ShapeType } from '@/features/canvas/lib/tools/ShapeTool/shape.config.ts';

interface CanvasState {
  activeTool: string;
  setActiveTool: (tool: string) => void;

  activeShape: ShapeType | null
  setActiveShape: (shape: ShapeType | null) => void

  toolStyles: Record<string, Record<string, unknown>>;
  setToolStyle: (toolId: string, patch: Record<string, unknown>) => void;
  engineRef: { current: CanvasEngine | null};
  setEngineRef: (ref: { current: CanvasEngine | null}) => void;
}

export const useCanvasStore = create<CanvasState>((set) => ({
  activeTool: 'select',
  setActiveTool: (tool) => set({ activeTool: tool }),
  activeShape: null,
  setActiveShape: (shape) => set({ activeShape: shape }),

  toolStyles: {},
  setToolStyle: (toolId, patch) =>
    set((state) => ({
      toolStyles: {
        ...state.toolStyles,
        [toolId]: { ...state.toolStyles[toolId], ...patch },
      },
    })),

  engineRef: { current: null },
  setEngineRef: (ref) => set({ engineRef: ref }),
}));
