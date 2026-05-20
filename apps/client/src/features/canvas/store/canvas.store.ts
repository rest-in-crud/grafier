import { create } from 'zustand';
import type { ToolId } from '@/pages/editor/types';
import type { ShapeType } from '@/features/canvas/lib/tools/ShapeTool/shape.config';
import { DEFAULT_SHAPE_TYPE } from '@/features/canvas/lib/tools/ShapeTool/shape.config';

export type ToolStyles = {
  pencil?: { width?: number; opacity?: number; color?: string };
  eraser?: { size?: number };
  text?: { fontSize?: number; fontFamily?: string; fontWeight?: string; fill?: string };
  shape?: { strokeWidth?: number; fill?: string; stroke?: string; opacity?: number };
};

interface CanvasState {
  activeTool: ToolId;
  setActiveTool: (tool: ToolId) => void;
  activeShape: ShapeType;
  setActiveShape: (shape: ShapeType) => void;
  toolStyles: ToolStyles;
  setToolStyle: <K extends keyof ToolStyles>(
    toolId: K,
    patch: Partial<NonNullable<ToolStyles[K]>>,
  ) => void;
}

export const useCanvasStore = create<CanvasState>((set) => ({
  activeTool: 'move',
  setActiveTool: (tool) => set({ activeTool: tool }),
  activeShape: DEFAULT_SHAPE_TYPE,
  setActiveShape: (shape) => set({ activeShape: shape }),
  toolStyles: {},
  setToolStyle: (toolId, patch) =>
    set((state) => ({
      toolStyles: {
        ...state.toolStyles,
        [toolId]: { ...state.toolStyles[toolId], ...patch },
      },
    })),
}));
