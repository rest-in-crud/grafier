import { IText } from 'fabric';
import type { Canvas, TPointerEventInfo, TPointerEvent } from 'fabric';
import type { BaseTool, FieldSchema } from '../BaseTool';
import type { ToolRegistration } from '../types';
import { FONT_FAMILIES, FONT_WEIGHTS } from '@/features/canvas/shared/constants/fontOptions';

export const TEXT_DEFAULT_STYLES = {
  fill: '#000000',
  fontSize: 20,
  fontFamily: FONT_FAMILIES[0],
  fontWeight: FONT_WEIGHTS[0],
  opacity: 1,
};

export class TextTool implements BaseTool {
  defaultStyles = TEXT_DEFAULT_STYLES;

  styleSchema: Record<string, FieldSchema> = {
    fill: { type: 'color', label: 'Color' },
    fontSize: { type: 'number', label: 'Size', min: 1, max: 200 },
    fontFamily: { type: 'select', label: 'Font', options: [...FONT_FAMILIES] },
    fontWeight: { type: 'select', label: 'Weight', options: [...FONT_WEIGHTS] },
  };

  private handler: ((e: TPointerEventInfo<TPointerEvent>) => void) | null = null;

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

const registration: ToolRegistration = { id: 'text', tool: new TextTool() };
export default registration;
