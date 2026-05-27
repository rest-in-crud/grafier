import type { Canvas, TPointerEventInfo, TPointerEvent } from 'fabric';
import type { BaseTool } from '../BaseTool';
import type { ToolRegistration } from '../types';
import { useCanvasStore } from '@/features/canvas/store/canvas.store';

export const FILL_DEFAULT_STYLES = {
  color: '#000000',
};

export class FillTool implements BaseTool {
  defaultStyles = { ...FILL_DEFAULT_STYLES };

  styleSchema = {
    color: { type: 'color', label: 'Color' },
  };

  private handler: ((e: TPointerEventInfo<TPointerEvent>) => void) | null = null;

  activate(canvas: Canvas) {
    canvas.isDrawingMode = false;
    canvas.selection = false;
    canvas.skipTargetFind = false;
    canvas.hoverCursor = 'crosshair';
    canvas.defaultCursor = 'crosshair';

    this.handler = (e) => {
      const target = e.target;
      if (!target) return;
      const styles = useCanvasStore.getState().toolStyles.fill;
      const color = typeof styles?.color === 'string' ? styles.color : FILL_DEFAULT_STYLES.color;
      target.set('fill', color);
      target.dirty = true;
      canvas.fire('object:modified', { target });
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
    canvas.skipTargetFind = false;
    canvas.hoverCursor = 'default';
    canvas.defaultCursor = 'default';
  }
}

const registration: ToolRegistration = { id: 'fill', tool: new FillTool() };
export default registration;
