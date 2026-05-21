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

export type SelectionSnapshot = {
  id: string;
  type: string;
  left: number;
  top: number;
  width: number;
  height: number;
  angle: number;
  opacity: number;
  fill: string | null;
  stroke: string | null;
  strokeWidth: number;
};

export type SelectionPatch = Partial<{
  left: number;
  top: number;
  width: number;
  height: number;
  angle: number;
  opacity: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
}>;

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
  selection: SelectionSnapshot | null;
  setSelection: (s: SelectionSnapshot | null) => void;
  applyToSelection: (patch: SelectionPatch) => void;
  setApplyToSelection: (fn: (patch: SelectionPatch) => void) => void;
  zoom: number;
  setZoom: (zoom: number) => void;
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
  selection: null,
  setSelection: (s) => set({ selection: s }),
  applyToSelection: () => {},
  setApplyToSelection: (fn) => set({ applyToSelection: fn }),
  zoom: 100,
  setZoom: (zoom) => set({ zoom }),
}));
