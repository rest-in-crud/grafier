import type { Canvas, FabricObject, Point, TPointerEventInfo, TPointerEvent } from 'fabric';
import type { BaseTool, FieldSchema } from '../BaseTool';
import type { ToolRegistration } from '../types';
import { useCanvasStore } from '@/features/canvas/store/canvas.store';
import {
  CLOSED_SHAPE_STYLE,
  DEFAULT_SHAPE_DIMENSIONS,
  DEFAULT_SHAPE_TYPE,
  LINE_SHAPE_STYLE,
  applyDimensions,
  createShapeObject,
  resizeShape,
} from './shape.config';
import type { ShapeModifiers, ShapeStyle, ShapeType } from './shape.config';

const QUICK_TAP_PX = 5;

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

  private mouseDown: ((e: TPointerEventInfo<TPointerEvent>) => void) | null = null;
  private mouseMove: ((e: TPointerEventInfo<TPointerEvent>) => void) | null = null;
  private mouseUp: ((e: TPointerEventInfo<TPointerEvent>) => void) | null = null;
  private onKeyDown: ((e: KeyboardEvent) => void) | null = null;
  private onKeyUp: ((e: KeyboardEvent) => void) | null = null;

  private start: Point | null = null;
  private lastPoint: Point | null = null;
  private downViewport: { x: number; y: number } | null = null;
  private currentShape: FabricObject | null = null;
  private currentType: ShapeType | null = null;
  private styles: Record<string, unknown> = this.defaultStyles;

  activate(canvas: Canvas, styles: Record<string, unknown> = this.defaultStyles) {
    canvas.isDrawingMode = false;
    canvas.selection = false;
    canvas.hoverCursor = 'crosshair';
    canvas.defaultCursor = 'crosshair';
    this.styles = styles;

    this.mouseDown = ({ scenePoint, viewportPoint }) => {
      const { activeTool, activeShape } = useCanvasStore.getState();
      if (activeTool !== 'shape') return;
      const type = activeShape ?? DEFAULT_SHAPE_TYPE;
      const isLine = type === 'line' || type === 'arrow';
      const shapeStyle = resolveShapeStyle(this.styles, isLine);
      const shape = createShapeObject(type, scenePoint, shapeStyle);
      canvas.add(shape);
      canvas.setActiveObject(shape);
      this.start = scenePoint;
      this.lastPoint = scenePoint;
      this.downViewport = { x: viewportPoint.x, y: viewportPoint.y };
      this.currentShape = shape;
      this.currentType = type;
    };

    this.mouseMove = ({ scenePoint, e }) => {
      if (!this.start || !this.currentShape || !this.currentType) return;
      this.lastPoint = scenePoint;
      const modifiers: ShapeModifiers =
        'shiftKey' in e && 'altKey' in e
          ? { shift: e.shiftKey, alt: e.altKey }
          : { shift: false, alt: false };
      resizeShape(this.currentShape, this.currentType, this.start, this.lastPoint, modifiers);
      canvas.requestRenderAll();
    };

    this.mouseUp = ({ viewportPoint }) => {
      if (!this.start || !this.currentShape || !this.currentType || !this.downViewport) {
        this.reset();
        return;
      }
      const dx = viewportPoint.x - this.downViewport.x;
      const dy = viewportPoint.y - this.downViewport.y;
      const dist = Math.hypot(dx, dy);
      if (dist < QUICK_TAP_PX) {
        applyDimensions(
          this.currentShape,
          this.currentType,
          this.start,
          DEFAULT_SHAPE_DIMENSIONS[this.currentType],
        );
      }
      canvas.requestRenderAll();
      useCanvasStore.getState().setActiveTool('move');
      this.reset();
    };

    this.onKeyDown = (e) => {
      if (!this.start || !this.currentShape || !this.currentType || !this.lastPoint) return;
      if (e.key === 'Escape') {
        canvas.remove(this.currentShape);
        canvas.requestRenderAll();
        this.reset();
        return;
      }
      if (e.key !== 'Shift' && e.key !== 'Alt') return;
      const modifiers: ShapeModifiers = { shift: e.shiftKey, alt: e.altKey };
      resizeShape(this.currentShape, this.currentType, this.start, this.lastPoint, modifiers);
      canvas.requestRenderAll();
    };

    this.onKeyUp = (e) => {
      if (!this.start || !this.currentShape || !this.currentType || !this.lastPoint) return;
      if (e.key !== 'Shift' && e.key !== 'Alt') return;
      const modifiers: ShapeModifiers = { shift: e.shiftKey, alt: e.altKey };
      resizeShape(this.currentShape, this.currentType, this.start, this.lastPoint, modifiers);
      canvas.requestRenderAll();
    };

    canvas.on('mouse:down', this.mouseDown);
    canvas.on('mouse:move', this.mouseMove);
    canvas.on('mouse:up', this.mouseUp);
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  private reset() {
    this.start = null;
    this.lastPoint = null;
    this.downViewport = null;
    this.currentShape = null;
    this.currentType = null;
  }

  deactivate(canvas: Canvas) {
    if (this.mouseDown) canvas.off('mouse:down', this.mouseDown);
    if (this.mouseMove) canvas.off('mouse:move', this.mouseMove);
    if (this.mouseUp) canvas.off('mouse:up', this.mouseUp);
    if (this.onKeyDown) window.removeEventListener('keydown', this.onKeyDown);
    if (this.onKeyUp) window.removeEventListener('keyup', this.onKeyUp);
    this.mouseDown = null;
    this.mouseMove = null;
    this.mouseUp = null;
    this.onKeyDown = null;
    this.onKeyUp = null;
    this.reset();
    canvas.selection = true;
  }

  suspend(canvas: Canvas): void {
    if (this.mouseDown) canvas.off('mouse:down', this.mouseDown);
    if (this.mouseMove) canvas.off('mouse:move', this.mouseMove);
    if (this.mouseUp) canvas.off('mouse:up', this.mouseUp);
    if (this.onKeyDown) window.removeEventListener('keydown', this.onKeyDown);
    if (this.onKeyUp) window.removeEventListener('keyup', this.onKeyUp);
    canvas.selection = true;
  }

  resume(canvas: Canvas): void {
    if (this.mouseDown) canvas.on('mouse:down', this.mouseDown);
    if (this.mouseMove) canvas.on('mouse:move', this.mouseMove);
    if (this.mouseUp) canvas.on('mouse:up', this.mouseUp);
    if (this.onKeyDown) window.addEventListener('keydown', this.onKeyDown);
    if (this.onKeyUp) window.addEventListener('keyup', this.onKeyUp);
    canvas.selection = false;
  }
}

const registration: ToolRegistration = { id: 'shape', tool: new ShapeTool(), behavior: 'insert' };
export default registration;
