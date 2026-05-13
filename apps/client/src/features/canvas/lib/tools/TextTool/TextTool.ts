import { BaseTool, ToolRegistration } from '@/features/canvas/lib/tools/BaseTool.ts';
import { Canvas, IText } from 'fabric';
import { TEXT_DEFAULT_STYLES, TEXT_STYLE_SCHEMA } from './TextTool.styles.ts';
import { injectGoogleFontsLink } from './googleFonts.ts';
import { loadTextFont } from './fontLoader.ts';
import { resolveStyles } from '@/features/canvas/shared/lib/resolveStyles.ts';

export class TextTool implements BaseTool {
  defaultStyles = { ...TEXT_DEFAULT_STYLES };
  styleSchema = TEXT_STYLE_SCHEMA;

  private handler: ((e: { scenePoint: { x: number; y: number } }) => void) | null = null;

  activate(canvas: Canvas, styles: Record<string, unknown> = this.defaultStyles) {
    injectGoogleFontsLink();

    canvas.isDrawingMode = false;
    canvas.selection = false;

    const s = resolveStyles(styles, TEXT_DEFAULT_STYLES);

    this.handler = async ({ scenePoint }) => {
      const activeHandler = this.handler;

      await loadTextFont(styles.fontFamily, styles.fontWeight);

      if (this.handler !== activeHandler) return;

      const text = new IText('', {
        left: scenePoint.x,
        top: scenePoint.y,
        fill: s.fill,
        fontSize: s.fontSize,
        fontFamily: s.fontFamily,
        fontWeight: s.fontWeight,
        opacity: s.opacity,
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
