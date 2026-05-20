import type { Canvas } from 'fabric';

export interface BaseTool {
  activate(canvas: Canvas): void;
  deactivate(canvas: Canvas): void;
}
