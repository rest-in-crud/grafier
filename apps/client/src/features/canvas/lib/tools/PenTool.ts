import { PencilBrush } from 'fabric';
import type { Canvas } from 'fabric';
import type { BaseTool } from './BaseTool';
import type { ToolRegistration } from './types';

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

const registration: ToolRegistration = { id: 'pencil', tool: new PenTool() };
export default registration;
