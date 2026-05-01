import { BaseTool, ToolRegistration } from '@/features/canvas/lib/tools/BaseTool.ts';
import { EraserBrush } from '@erase2d/fabric';
import { Canvas } from 'fabric';

export const ERASER_DEFAULT_STYLES = {
  size: 20,
};

export class EraserTool implements BaseTool {
  defaultStyles = { ...ERASER_DEFAULT_STYLES };

  styleSchema = {
    size: { type: 'range', label: 'Size', min: 1, max: 200, unit: 'px' },
  };

  activate(canvas: Canvas, styles: Record<string, unknown> = {}) {
    const brush = new EraserBrush(canvas);
    brush.width = typeof styles.size === 'number' ? styles.size : ERASER_DEFAULT_STYLES.size;
    canvas.freeDrawingBrush = brush;
    canvas.isDrawingMode = true;
  }

  deactivate(canvas: Canvas) {
    canvas.isDrawingMode = false;
  }
}

export default { id: 'eraser', tool: new EraserTool() } satisfies ToolRegistration;