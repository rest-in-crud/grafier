import type { Canvas, TPointerEventInfo, TPointerEvent, TMat2D } from 'fabric';
import type { BaseTool } from '../BaseTool';
import type { ToolRegistration } from '../types';

export class HandTool implements BaseTool {
  private panStart: { x: number; y: number; vt: TMat2D } | null = null;
  private downHandler: ((e: TPointerEventInfo<TPointerEvent>) => void) | null = null;
  private moveHandler: ((e: TPointerEventInfo<TPointerEvent>) => void) | null = null;
  private upHandler: (() => void) | null = null;

  activate(canvas: Canvas) {
    canvas.isDrawingMode = false;
    canvas.selection = false;
    canvas.skipTargetFind = true;
    canvas.hoverCursor = 'grab';
    canvas.defaultCursor = 'grab';

    this.downHandler = (e) => {
      const vt = canvas.viewportTransform;
      if (!vt) return;
      this.panStart = { x: e.viewportPoint.x, y: e.viewportPoint.y, vt: [...vt] };
      canvas.defaultCursor = 'grabbing';
    };

    this.moveHandler = (e) => {
      if (!this.panStart) return;
      const dx = e.viewportPoint.x - this.panStart.x;
      const dy = e.viewportPoint.y - this.panStart.y;
      const vt: TMat2D = [...this.panStart.vt];
      vt[4] += dx;
      vt[5] += dy;
      canvas.setViewportTransform(vt);
    };

    this.upHandler = () => {
      this.panStart = null;
      canvas.defaultCursor = 'grab';
    };

    canvas.on('mouse:down', this.downHandler);
    canvas.on('mouse:move', this.moveHandler);
    canvas.on('mouse:up', this.upHandler);
  }

  deactivate(canvas: Canvas) {
    if (this.downHandler) canvas.off('mouse:down', this.downHandler);
    if (this.moveHandler) canvas.off('mouse:move', this.moveHandler);
    if (this.upHandler) canvas.off('mouse:up', this.upHandler);
    this.downHandler = null;
    this.moveHandler = null;
    this.upHandler = null;
    this.panStart = null;
    canvas.selection = true;
    canvas.skipTargetFind = false;
    canvas.hoverCursor = 'default';
    canvas.defaultCursor = 'default';
  }
}

const registration: ToolRegistration = { id: 'hand', tool: new HandTool() };
export default registration;