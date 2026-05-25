import { IText } from 'fabric';
import type { Canvas, TPointerEventInfo, TPointerEvent } from 'fabric';
import type { BaseTool, FieldSchema } from '../BaseTool';
import type { ToolRegistration } from '../types';
import {
  DEFAULT_TEXT_FONT_FAMILY,
  DEFAULT_TEXT_FONT_WEIGHT,
  GOOGLE_TEXT_FONTS,
  GOOGLE_TEXT_FONT_WEIGHTS,
  injectGoogleFontsLink,
} from './googleFonts';
import { loadTextFont } from './fontLoader';

export const TEXT_DEFAULT_STYLES = {
  fill: '#000000',
  fontSize: 20,
  fontFamily: DEFAULT_TEXT_FONT_FAMILY,
  fontWeight: DEFAULT_TEXT_FONT_WEIGHT,
  opacity: 1,
};

export class TextTool implements BaseTool {
  defaultStyles = TEXT_DEFAULT_STYLES;

  styleSchema: Record<string, FieldSchema> = {
    fill: { type: 'color', label: 'Color' },
    fontSize: { type: 'number', label: 'Size', min: 1, max: 200 },
    fontFamily: { type: 'select', label: 'Font', options: [...GOOGLE_TEXT_FONTS] },
    fontWeight: { type: 'select', label: 'Weight', options: [...GOOGLE_TEXT_FONT_WEIGHTS] },
  };

  private handler: ((e: TPointerEventInfo<TPointerEvent>) => void) | null = null;

  activate(canvas: Canvas, styles: Record<string, unknown> = {}) {
    const merged = { ...TEXT_DEFAULT_STYLES, ...styles };
    injectGoogleFontsLink();
    canvas.isDrawingMode = false;
    canvas.selection = false;
    canvas.hoverCursor = 'crosshair';
    canvas.defaultCursor = 'crosshair';

    this.handler = async ({ scenePoint }) => {
      const activeHandler = this.handler;
      await loadTextFont(merged.fontFamily, merged.fontWeight);
      if (this.handler !== activeHandler) return;

      const text = new IText('', {
        left: scenePoint.x,
        top: scenePoint.y,
        ...merged,
      });
      canvas.add(text);
      canvas.setActiveObject(text);
      text.enterEditing();
      canvas.requestRenderAll();

      text.once('editing:exited', () => {
        if (text.text === '') {
          canvas.remove(text);
          canvas.requestRenderAll();
        }
      });
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

  suspend(canvas: Canvas): void {
    if (this.handler) canvas.off('mouse:down', this.handler);
    canvas.selection = true;
  }

  resume(canvas: Canvas): void {
    if (this.handler) canvas.on('mouse:down', this.handler);
    canvas.selection = false;
  }
}

const registration: ToolRegistration = { id: 'text', tool: new TextTool() };
export default registration;
