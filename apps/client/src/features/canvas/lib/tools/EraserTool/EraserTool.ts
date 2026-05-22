import { EraserBrush } from '@erase2d/fabric';
import type { Canvas, FabricObject } from 'fabric';
import { removeFromLayer } from '../../removeFromLayer';
import type { BaseTool } from '../BaseTool';
import type { ToolRegistration } from '../types';

export const ERASER_DEFAULT_STYLES = {
  size: 20,
};

export class EraserTool implements BaseTool {
  defaultStyles = { ...ERASER_DEFAULT_STYLES };

  styleSchema = {
    size: { type: 'range', label: 'Size', min: 1, max: 200, unit: 'px' },
  };

  activate(canvas: Canvas, styles: Record<string, unknown> = {}) {
    const brush = new EraserBrush(canvas);
    brush.width = typeof styles.size === 'number' ? styles.size : ERASER_DEFAULT_STYLES.size;
    brush.on('end', (e) => {
      const { targets } = e.detail;
      requestAnimationFrame(() => {
        for (const target of targets) {
          if (this.isFullyErased(target)) {
            canvas.remove(target);
            removeFromLayer(target);
          }
        }
        canvas.requestRenderAll();
      });
    });
    canvas.freeDrawingBrush = brush;
    canvas.isDrawingMode = true;
    canvas.defaultCursor = 'default';
    canvas.hoverCursor = canvas.defaultCursor;
  }

  private isFullyErased(obj: FabricObject): boolean {
    const tmpCanvas = document.createElement('canvas');
    const bounds = obj.getBoundingRect();
    const scale = 0.25;

    tmpCanvas.width = Math.ceil(bounds.width * scale);
    tmpCanvas.height = Math.ceil(bounds.height * scale);

    const ctx = tmpCanvas.getContext('2d');
    if (!ctx || tmpCanvas.width === 0 || tmpCanvas.height === 0) return false;

    ctx.scale(scale, scale);
    ctx.translate(-bounds.left, -bounds.top);
    obj.render(ctx);

    const pixels = ctx.getImageData(0, 0, tmpCanvas.width, tmpCanvas.height).data;
    for (let i = 3; i < pixels.length; i += 16) {
      if (pixels[i] > 10) return false;
    }
    return true;
  }

  deactivate(canvas: Canvas) {
    canvas.isDrawingMode = false;
  }
}

const registration: ToolRegistration = { id: 'eraser', tool: new EraserTool() };
export default registration;
