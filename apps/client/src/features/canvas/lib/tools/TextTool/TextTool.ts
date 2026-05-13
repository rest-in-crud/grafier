import { BaseTool, ToolRegistration } from '@/features/canvas/lib/tools/BaseTool.ts';
import { Canvas, IText } from 'fabric';

export const TEXT_STYLES = {
  fill: '#000000',
  fontSize: 20,
  fontFamily: 'Arial',
  fontWeight: 'normal' as const,
  opacity: 1,
}

export class TextTool implements BaseTool {
  defaultStyles = TEXT_STYLES

  styleSchema = {
    fill:       { type: 'color',  label: 'Color' },
    fontSize:   { type: 'number', label: 'Size', min: 1, max: 200 },
    fontFamily: { type: 'select', label: 'Font', options: ['Arial', 'Georgia', 'Courier New', 'Times New Roman', 'Verdana'] },
    fontWeight: { type: 'select', label: 'Weight', options: ['normal', 'bold'] },
  }

  private handler: ((e: { scenePoint: { x: number; y: number } }) => void) | null = null;

  activate(canvas: Canvas, styles: Record<string, unknown> = this.defaultStyles) {
    canvas.isDrawingMode = false;
    canvas.selection = false;

    this.handler = ({ scenePoint }) => {
      const text = new IText('', {
        left: scenePoint.x,
        top: scenePoint.y,
        ...styles,
      });

      canvas.add(text);
      canvas.setActiveObject(text);
      text.enterEditing();
      canvas.requestRenderAll();
    };

    canvas.on('mouse:down', this.handler);
  }

  deactivate(canvas: Canvas) {
    if (this.handler) {
      canvas.off('mouse:down', this.handler);
      this.handler = null;
    }
    canvas.selection = true;
  }
}

export default { id: 'text', tool: new TextTool() } satisfies ToolRegistration;
