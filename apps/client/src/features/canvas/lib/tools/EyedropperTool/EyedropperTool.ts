import type { Canvas, TPointerEventInfo, TPointerEvent } from 'fabric';
import type { BaseTool } from '../BaseTool';
import type { ToolRegistration } from '../types';
import { useCanvasStore } from '@/features/canvas/store/canvas.store';

function sampleHex(canvas: Canvas, viewportX: number, viewportY: number): string {
  const dpr = canvas.getRetinaScaling();
  const ctx = canvas.lowerCanvasEl.getContext('2d');
  if (!ctx) return '#000000';
  const data = ctx.getImageData(Math.round(viewportX * dpr), Math.round(viewportY * dpr), 1, 1).data;
  const r = data[0] ?? 0;
  const g = data[1] ?? 0;
  const b = data[2] ?? 0;
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
}

export class EyedropperTool implements BaseTool {
  private handler: ((e: TPointerEventInfo<TPointerEvent>) => void) | null = null;

  activate(canvas: Canvas) {
    canvas.isDrawingMode = false;
    canvas.selection = false;
    canvas.skipTargetFind = true;
    canvas.hoverCursor = 'crosshair';
    canvas.defaultCursor = 'crosshair';

    this.handler = (e) => {
      const hex = sampleHex(canvas, e.viewportPoint.x, e.viewportPoint.y);
      const store = useCanvasStore.getState();
      store.setEyedropperColor(hex);
      store.showToast(hex.toUpperCase());
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

const registration: ToolRegistration = { id: 'dropper', tool: new EyedropperTool() };
export default registration;