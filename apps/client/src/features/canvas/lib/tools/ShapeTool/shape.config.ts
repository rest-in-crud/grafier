import { Circle, Ellipse, Line, Path, Rect, Triangle } from 'fabric';
import type { FabricObject } from 'fabric';

export type ShapeType = 'rect' | 'square' | 'circle' | 'ellipse' | 'triangle' | 'line' | 'arrow';

export type ShapePoint = {
  x: number;
  y: number;
};

export type ShapeStyle = {
  fill?: string;
  stroke: string;
  strokeWidth: number;
  opacity: number;
};

export type ShapeOption = {
  type: ShapeType;
  label: string;
};

export const SHAPE_OPTIONS: ShapeOption[] = [
  { type: 'rect', label: 'Rect' },
  { type: 'square', label: 'Square' },
  { type: 'circle', label: 'Circle' },
  { type: 'ellipse', label: 'Ellipse' },
  { type: 'triangle', label: 'Triangle' },
  { type: 'line', label: 'Line' },
  { type: 'arrow', label: 'Arrow' },
];

export const DEFAULT_SHAPE_TYPE: ShapeType = 'rect';

export const CLOSED_SHAPE_STYLE: ShapeStyle = {
  fill: 'rgba(59, 130, 246, 0.15)',
  stroke: '#2563eb',
  strokeWidth: 2,
  opacity: 1,
};

export const LINE_SHAPE_STYLE: ShapeStyle = {
  fill: 'transparent',
  stroke: '#2563eb',
  strokeWidth: 2,
  opacity: 1,
};

const COMMON_OBJECT_OPTIONS = {
  originX: 'center' as const,
  originY: 'center' as const,
  selectable: true,
  evented: true,
};

const lineOptions = (point: ShapePoint, style: ShapeStyle) => ({
  ...COMMON_OBJECT_OPTIONS,
  left: point.x,
  top: point.y,
  fill: style.fill,
  stroke: style.stroke,
  strokeWidth: style.strokeWidth,
  opacity: style.opacity,
  strokeLineCap: 'round' as const,
  strokeLineJoin: 'round' as const,
});

const closedOptions = (point: ShapePoint, style: ShapeStyle) => ({
  ...COMMON_OBJECT_OPTIONS,
  left: point.x,
  top: point.y,
  fill: style.fill,
  stroke: style.stroke,
  strokeWidth: style.strokeWidth,
  opacity: style.opacity,
});

export function createShapeObject(
  type: ShapeType,
  point: ShapePoint,
  style: ShapeStyle = type === 'line' || type === 'arrow' ? LINE_SHAPE_STYLE : CLOSED_SHAPE_STYLE,
): FabricObject {
  switch (type) {
    case 'rect':
      return new Rect({ ...closedOptions(point, style), width: 120, height: 80 });
    case 'square':
      return new Rect({ ...closedOptions(point, style), width: 100, height: 100 });
    case 'circle':
      return new Circle({ ...closedOptions(point, style), radius: 50 });
    case 'ellipse':
      return new Ellipse({ ...closedOptions(point, style), rx: 70, ry: 45 });
    case 'triangle':
      return new Triangle({ ...closedOptions(point, style), width: 110, height: 100 });
    case 'line':
      return new Line([-70, 0, 70, 0], lineOptions(point, style));
    case 'arrow':
      return new Path('M -70 0 L 70 0 M 48 -14 L 70 0 L 48 14', lineOptions(point, style));
  }
}
