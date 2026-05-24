import { create } from 'zustand';
import type { Point } from 'fabric';
import type { ToolId } from '@/pages/editor/types';
import type { ShapeType } from '@/features/canvas/lib/tools/ShapeTool/shape.config';
import { DEFAULT_SHAPE_TYPE } from '@/features/canvas/lib/tools/ShapeTool/shape.config';
import { loadToolStyles, saveToolStyles } from '@/features/canvas/lib/persistence';

export type ToolStyles = {
  pencil?: { width?: number; opacity?: number; color?: string };
  brush?: { color?: string; width?: number; opacity?: number; smoothing?: number };
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
  eyedropperColor: string | null;
  setEyedropperColor: (color: string | null) => void;
  lastShapeColorTarget: 'fill' | 'stroke';
  toast: { message: string; id: number } | null;
  showToast: (message: string) => void;
  hideToast: () => void;
  selection: SelectionState;
  setSelection: (selection: SelectionState) => void;
  applyToSelection: (patch: SelectionPatch) => void;
  setApplyToSelection: (fn: (patch: SelectionPatch) => void) => void;
  selectObjectById: (id: string) => void;
  selectObjectsByIds: (ids: string[]) => void;
  setSelectObjectById: (fn: (id: string) => void) => void;
  setSelectObjectsByIds: (fn: (ids: string[]) => void) => void;
  duplicateSelection: () => void;
  setDuplicateSelection: (fn: () => void) => void;
  removeObjectById: (id: string) => void;
  setRemoveObjectById: (fn: (id: string) => void) => void;
  zoom: number;
  setZoom: (zoom: number) => void;
  zoomToPoint: (zoom: number, point: Point) => void;
  setZoomToPoint: (fn: (zoom: number, point: Point) => void) => void;
  canvasBgColor: string;
  setCanvasBgColor: (color: string) => void;
}

const COLORABLE_TOOLS = new Set<ToolId>(['pencil', 'brush', 'text', 'shape']);

const TOOL_COLOR_FIELD: Partial<Record<ToolId, string>> = {
  pencil: 'color',
  brush: 'color',
  text: 'fill',
} as const;

export const useCanvasStore = create<CanvasState>((set) => ({
  activeTool: 'move',
  setActiveTool: (tool) =>
    set((state) => {
      if (state.eyedropperColor !== null && COLORABLE_TOOLS.has(tool)) {
        const color = state.eyedropperColor;
        const field = tool === 'shape' ? state.lastShapeColorTarget : TOOL_COLOR_FIELD[tool];
        if (!field) return { activeTool: tool };
        const toolKey = tool as keyof ToolStyles;
        const nextStyles: ToolStyles = {
          ...state.toolStyles,
          [toolKey]: { ...state.toolStyles[toolKey], [field]: color },
        };
        saveToolStyles(nextStyles);
        return { activeTool: tool, eyedropperColor: null, toolStyles: nextStyles };
      }
      return { activeTool: tool };
    }),
  activeShape: DEFAULT_SHAPE_TYPE,
  setActiveShape: (shape) => set({ activeShape: shape }),
  toolStyles: loadToolStyles(),
  setToolStyle: (toolId, patch) =>
    set((state) => {
      const nextToolStyles: ToolStyles = {
        ...state.toolStyles,
        [toolId]: { ...state.toolStyles[toolId], ...patch },
      };
      saveToolStyles(nextToolStyles);
      if (toolId === 'shape') {
        if ('fill' in patch) {
          return { toolStyles: nextToolStyles, lastShapeColorTarget: 'fill' as const };
        }
        if ('stroke' in patch) {
          return { toolStyles: nextToolStyles, lastShapeColorTarget: 'stroke' as const };
        }
      }
      return { toolStyles: nextToolStyles };
    }),
  eyedropperColor: null,
  setEyedropperColor: (color) => set({ eyedropperColor: color }),
  lastShapeColorTarget: 'fill',
  toast: null,
  showToast: (message) => set((state) => ({ toast: { message, id: (state.toast?.id ?? 0) + 1 } })),
  hideToast: () => set({ toast: null }),
  selection: { ids: [], primary: null },
  setSelection: (selection) => set({ selection }),
  applyToSelection: () => {},
  setApplyToSelection: (fn) => set({ applyToSelection: fn }),
  selectObjectById: () => {},
  selectObjectsByIds: () => {},
  setSelectObjectById: (fn) => set({ selectObjectById: fn }),
  setSelectObjectsByIds: (fn) => set({ selectObjectsByIds: fn }),
  duplicateSelection: () => {},
  setDuplicateSelection: (fn) => set({ duplicateSelection: fn }),
  removeObjectById: () => {},
  setRemoveObjectById: (fn) => set({ removeObjectById: fn }),
  zoom: 100,
  setZoom: (zoom) => set({ zoom }),
  zoomToPoint: () => {},
  setZoomToPoint: (fn) => set({ zoomToPoint: fn }),
  canvasBgColor: '#ffffff',
  setCanvasBgColor: (color) => set({ canvasBgColor: color }),
}));
