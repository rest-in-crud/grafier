import { BaseTool, ToolRegistration } from '@/features/canvas/lib/tools/BaseTool.ts';
import { Canvas, IText } from 'fabric';
import {
  DEFAULT_TEXT_FONT_FAMILY,
  DEFAULT_TEXT_FONT_WEIGHT,
  TEXT_FONT_FAMILY_OPTIONS,
  TEXT_FONT_WEIGHT_OPTIONS,
} from './fontOptions';
import { injectGoogleFontsLink } from './googleFonts';
import { loadTextFont } from './fontLoader';

export const TEXT_STYLES = {
  fill: '#000000',
  fontSize: 20,
  fontFamily: DEFAULT_TEXT_FONT_FAMILY,
  fontWeight: DEFAULT_TEXT_FONT_WEIGHT,
  opacity: 1,
};

export class TextTool implements BaseTool {
  defaultStyles = TEXT_STYLES;

  styleSchema = {
    fill: { type: 'color', label: 'Color' },
    fontSize: { type: 'number', label: 'Size', min: 1, max: 200 },
    fontFamily: { type: 'select', label: 'Font', options: TEXT_FONT_FAMILY_OPTIONS },
    fontWeight: { type: 'select', label: 'Weight', options: TEXT_FONT_WEIGHT_OPTIONS },
  };

  private handler: ((e: { scenePoint: { x: number; y: number } }) => void) | null = null;

  activate(canvas: Canvas, styles: Record<string, unknown> = this.defaultStyles) {
    injectGoogleFontsLink();

    canvas.isDrawingMode = false;
    canvas.selection = false;

    this.handler = async ({ scenePoint }) => {
      const activeHandler = this.handler;

      await loadTextFont(styles.fontFamily, styles.fontWeight);

      if (this.handler !== activeHandler) return;

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
