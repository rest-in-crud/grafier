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

export type SelectionState = {
  ids: string[];
  primary: SelectionSnapshot | null;
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
  selection: SelectionState;
  setSelection: (selection: SelectionState) => void;
  applyToSelection: (patch: SelectionPatch) => void;
  setApplyToSelection: (fn: (patch: SelectionPatch) => void) => void;
  selectObjectById: (id: string) => void;
  selectObjectsByIds: (ids: string[]) => void;
  setSelectObjectById: (fn: (id: string) => void) => void;
  setSelectObjectsByIds: (fn: (ids: string[]) => void) => void;
  zoom: number;
  setZoom: (zoom: number) => void;
  canvasBgColor: string;
  setCanvasBgColor: (color: string) => void;
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
  selection: { ids: [], primary: null },
  setSelection: (selection) => set({ selection }),
  applyToSelection: () => {},
  setApplyToSelection: (fn) => set({ applyToSelection: fn }),
  selectObjectById: () => {},
  selectObjectsByIds: () => {},
  setSelectObjectById: (fn) => set({ selectObjectById: fn }),
  setSelectObjectsByIds: (fn) => set({ selectObjectsByIds: fn }),
  zoom: 100,
  setZoom: (zoom) => set({ zoom }),
  canvasBgColor: '#ffffff',
  setCanvasBgColor: (color) => set({ canvasBgColor: color }),
}));
