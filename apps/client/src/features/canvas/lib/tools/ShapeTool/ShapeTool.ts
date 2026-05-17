import { Canvas } from 'fabric';
import { BaseTool, FieldSchema, ToolRegistration } from '@/features/canvas/lib/tools/BaseTool.ts';
import { useCanvasStore } from '@/features/canvas/store/canvas.store.ts';
import {
  CLOSED_SHAPE_STYLE,
  createShapeObject,
  DEFAULT_SHAPE_TYPE,
  LINE_SHAPE_STYLE,
  ShapeStyle,
} from '@/features/canvas/lib/shapes/shape.config.ts';

const SHAPE_STYLE_SCHEMA: Record<string, FieldSchema> = {
  fill: { type: 'color', label: 'Fill' },
  stroke: { type: 'color', label: 'Stroke' },
  strokeWidth: { type: 'range', label: 'Width', min: 1, max: 50, unit: 'px' },
  opacity: { type: 'range', label: 'Opacity', min: 0, max: 1 },
};

function resolveShapeStyle(styles: Record<string, unknown>, isLine: boolean): ShapeStyle {
  const defaults = isLine ? LINE_SHAPE_STYLE : CLOSED_SHAPE_STYLE;
  return {
    fill: typeof styles.fill === 'string' ? styles.fill : defaults.fill,
    stroke: typeof styles.stroke === 'string' ? styles.stroke : defaults.stroke,
    strokeWidth: typeof styles.strokeWidth === 'number' ? styles.strokeWidth : defaults.strokeWidth,
    opacity: typeof styles.opacity === 'number' ? styles.opacity : defaults.opacity,
  };
}

export class ShapeTool implements BaseTool {
  defaultStyles = { ...CLOSED_SHAPE_STYLE };
  styleSchema = SHAPE_STYLE_SCHEMA;

  private handler: ((e: { scenePoint: { x: number; y: number } }) => void) | null = null;

  activate(canvas: Canvas, styles: Record<string, unknown> = this.defaultStyles) {
    canvas.isDrawingMode = false;
    canvas.selection = false;

    if (this.handler) {
      canvas.off('mouse:down', this.handler);
    }

    this.handler = ({ scenePoint }) => {
      const { activeTool, activeShape } = useCanvasStore.getState();

      if (activeTool !== 'shape') return;

      const shapeType = activeShape ?? DEFAULT_SHAPE_TYPE;
      const isLine = shapeType === 'line' || shapeType === 'arrow';
      const shapeStyle = resolveShapeStyle(styles, isLine);
      const shape = createShapeObject(shapeType, scenePoint, shapeStyle);

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