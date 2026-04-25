import { BaseTool } from '@/features/canvas/lib/tools/BaseTool.ts';
import { Canvas, PencilBrush } from 'fabric';

export class PenTool implements BaseTool {
  activate(canvas: Canvas) {
    canvas.freeDrawingBrush = new PencilBrush(canvas);
    canvas.freeDrawingBrush.color = 'black';
    canvas.freeDrawingBrush.width = 5;
    canvas.isDrawingMode = true;
  }
  deactivate(canvas: Canvas) {
    canvas.isDrawingMode = false;
  }
}

export default { id: 'pen', tool: new PenTool() };
