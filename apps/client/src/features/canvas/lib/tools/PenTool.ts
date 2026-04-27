import {BaseTool, ToolRegistration} from '@/features/canvas/lib/tools/BaseTool.ts';
import { Canvas, PencilBrush } from 'fabric';

export class PenTool implements BaseTool {
  defaultStyles = { color: '#000000', width: 5 }

  styleSchema = {
    color: { type: 'color', label: 'Color' },
    width: { type: 'range', label: 'Width', min: 1, max: 50, unit: 'px' },
  }

  activate(canvas: Canvas, styles: Record<string, unknown> = this.defaultStyles) {
    canvas.freeDrawingBrush = new PencilBrush(canvas);
    const color = typeof styles.color === 'string' ? styles.color : this.defaultStyles.color;
    const width = typeof styles.width === 'number' ? styles.width : this.defaultStyles.width;

    canvas.freeDrawingBrush.color = color;
    canvas.freeDrawingBrush.width = width;
    canvas.isDrawingMode = true;
  }
  deactivate(canvas: Canvas) {
    canvas.isDrawingMode = false;
  }
}

export default { id: 'pen', tool: new PenTool() } satisfies ToolRegistration;
