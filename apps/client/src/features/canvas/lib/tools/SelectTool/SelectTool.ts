import type { Canvas } from 'fabric';
import type { BaseTool } from '../BaseTool';
import type { ToolRegistration } from '../types';

export class SelectTool implements BaseTool {
  activate(canvas: Canvas) {
    canvas.isDrawingMode = false;
    canvas.selection = true;
    canvas.hoverCursor = 'move';
  }
  deactivate(canvas: Canvas) {
    canvas.selection = false;
  }
}

const registration: ToolRegistration = { id: 'move', tool: new SelectTool() };
export default registration;
