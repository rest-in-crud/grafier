import { PencilBrush, SprayBrush } from 'fabric';
import type { Canvas, Shadow } from 'fabric';
import type { BaseTool } from '../BaseTool';
import type { ToolRegistration } from '../types';
import { PEN_DEFAULT_STYLES, PEN_STYLE_SCHEMA, DASH_PRESETS } from './PenTool.styles';
import type { PenStyles } from './PenTool.styles';
import { resolveStyles } from '@/features/canvas/shared/lib/resolveStyles';
import { buildShadow, hexToRgba } from '@/features/canvas/shared/lib/fabricHelpers';

export class PenTool implements BaseTool {
  defaultStyles = { ...PEN_DEFAULT_STYLES };
  styleSchema = PEN_STYLE_SCHEMA;

  activate(canvas: Canvas, styles: Record<string, unknown> = {}) {
    const s = resolveStyles(styles, PEN_DEFAULT_STYLES);
    const brushColor = hexToRgba(s.color, s.opacity);
    const shadow = buildShadow(s);

    canvas.freeDrawingBrush =
      s.brushType === 'spray'
        ? this.createSprayBrush(canvas, s, brushColor, shadow)
        : this.createPencilBrush(canvas, s, brushColor, shadow);

    canvas.isDrawingMode = true;
  }

  private createPencilBrush(canvas: Canvas, s: PenStyles, color: string, shadow: Shadow | null) {
    const brush = new PencilBrush(canvas);
    brush.color = color;
    brush.width = s.width;
    brush.limitedToCanvasSize = s.limitedToCanvasSize;
    brush.shadow = shadow;
    brush.strokeLineCap = s.strokeLineCap;
    brush.strokeLineJoin = s.strokeLineJoin;
    brush.strokeMiterLimit = s.strokeMiterLimit;
    brush.strokeDashArray = DASH_PRESETS[s.strokeDashArray] ?? null;
    brush.straightLineKey = s.straightLineKey === 'none' ? null : s.straightLineKey;
    return brush;
  }

  private createSprayBrush(canvas: Canvas, s: PenStyles, color: string, shadow: Shadow | null) {
    const brush = new SprayBrush(canvas);
    brush.color = color;
    brush.width = s.width;
    brush.limitedToCanvasSize = s.limitedToCanvasSize;
    brush.shadow = shadow;
    brush.density = s.density;
    brush.dotWidth = s.dotWidth;
    brush.dotWidthVariance = s.dotWidthVariance;
    brush.randomOpacity = s.randomOpacity;
    return brush;
  }

  deactivate(canvas: Canvas) {
    canvas.isDrawingMode = false;
  }
}

const registration: ToolRegistration = { id: 'pencil', tool: new PenTool() };
export default registration;
