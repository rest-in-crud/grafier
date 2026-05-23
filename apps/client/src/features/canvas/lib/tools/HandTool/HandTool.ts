import type { Canvas } from 'fabric';
import type { BaseTool } from '../BaseTool';
import type { ToolRegistration } from '../types';

export class HandTool implements BaseTool {
  activate(canvas: Canvas) {
    canvas.isDrawingMode = false;
    canvas.selection = false;
    canvas.skipTargetFind = true;
    canvas.hoverCursor = 'grab';
    canvas.defaultCursor = 'grab';
  }

  deactivate(canvas: Canvas) {
    canvas.selection = true;
    canvas.skipTargetFind = false;
    canvas.hoverCursor = 'default';
    canvas.defaultCursor = 'default';
  }
}

const registration: ToolRegistration = { id: 'hand', tool: new HandTool() };
export default registration;