import { create } from 'zustand';
import type { ToolId } from '@/pages/editor/types';
import type { ShapeType } from '@/features/canvas/lib/tools/ShapeTool/shape.config';
import { DEFAULT_SHAPE_TYPE } from '@/features/canvas/lib/tools/ShapeTool/shape.config';

interface CanvasState {
  activeTool: ToolId;
  setActiveTool: (tool: ToolId) => void;
  activeShape: ShapeType;
  setActiveShape: (shape: ShapeType) => void;
}

export const useCanvasStore = create<CanvasState>((set) => ({
  activeTool: 'move',
  setActiveTool: (tool) => set({ activeTool: tool }),
  activeShape: DEFAULT_SHAPE_TYPE,
  setActiveShape: (shape) => set({ activeShape: shape }),
}));
