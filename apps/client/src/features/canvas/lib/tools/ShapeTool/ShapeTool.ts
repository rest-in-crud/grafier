import { Canvas } from 'fabric';
import { BaseTool, ToolRegistration } from '@/features/canvas/lib/tools/BaseTool.ts';
import { useCanvasStore } from '@/features/canvas/store/canvas.store.ts';
import {
  CLOSED_SHAPE_STYLE,
  createShapeObject,
  DEFAULT_SHAPE_TYPE,
  LINE_SHAPE_STYLE,
} from '@/features/canvas/lib/shapes/shape.config.ts';

export class ShapeTool implements BaseTool {
  defaultStyles = {
    ...CLOSED_SHAPE_STYLE,
    lineFill: LINE_SHAPE_STYLE.fill,
    lineStroke: LINE_SHAPE_STYLE.stroke,
    lineStrokeWidth: LINE_SHAPE_STYLE.strokeWidth,
    lineOpacity: LINE_SHAPE_STYLE.opacity,
  };

  private handler: ((e: { scenePoint: { x: number; y: number } }) => void) | null = null;

  activate(canvas: Canvas) {
    canvas.isDrawingMode = false;
    canvas.selection = false;

    if (this.handler) {
      canvas.off('mouse:down', this.handler);
    }

    this.handler = ({ scenePoint }) => {
      const { activeTool, activeShape } = useCanvasStore.getState();

      if (activeTool !== 'shape') return;

      const shapeType = activeShape ?? DEFAULT_SHAPE_TYPE;
      const shape = createShapeObject(shapeType, scenePoint);

      canvas.add(shape);
      canvas.setActiveObject(shape);
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

export default { id: 'shape', tool: new ShapeTool() } satisfies ToolRegistration;
