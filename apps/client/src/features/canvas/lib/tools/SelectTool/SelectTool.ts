import {BaseTool, ToolRegistration} from '@/features/canvas/lib/tools/BaseTool.ts';
import { Canvas } from 'fabric';
export class SelectTool implements BaseTool {
  activate(canvas: Canvas, _styles?: Record<string, unknown>) {
    canvas.isDrawingMode = false;
    canvas.selection = true;
  }
  deactivate(canvas: Canvas) {
    canvas.selection = false;
  }
}

export default { id: 'select', tool: new SelectTool() } satisfies ToolRegistration;
