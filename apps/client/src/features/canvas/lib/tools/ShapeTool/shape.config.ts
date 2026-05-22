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

export type ShapeDimensions =
  | { width: number; height: number }
  | { radius: number }
  | { rx: number; ry: number }
  | { length: number };

export const DEFAULT_SHAPE_DIMENSIONS: Record<ShapeType, ShapeDimensions> = {
  rect: { width: 120, height: 80 },
  square: { width: 100, height: 100 },
  circle: { radius: 50 },
  ellipse: { rx: 70, ry: 45 },
  triangle: { width: 110, height: 100 },
  line: { length: 140 },
  arrow: { length: 140 },
};

export const ARROWHEAD_SIZE = 22;
export const ARROWHEAD_HALF_WIDTH = 14;

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
  const dims = DEFAULT_SHAPE_DIMENSIONS[type];
  switch (type) {
    case 'rect':
    case 'square':
    case 'triangle': {
      if (!('width' in dims)) throw new Error(`expected width/height dims for ${type}`);
      const opts = { ...closedOptions(point, style), width: dims.width, height: dims.height };
      if (type === 'triangle') return new Triangle(opts);
      return new Rect(opts);
    }
    case 'circle': {
      if (!('radius' in dims)) throw new Error(`expected radius dims for circle`);
      return new Circle({ ...closedOptions(point, style), radius: dims.radius });
    }
    case 'ellipse': {
      if (!('rx' in dims)) throw new Error(`expected rx/ry dims for ellipse`);
      return new Ellipse({ ...closedOptions(point, style), rx: dims.rx, ry: dims.ry });
    }
    case 'line': {
      if (!('length' in dims)) throw new Error(`expected length dims for line`);
      const half = dims.length / 2;
      return new Line([-half, 0, half, 0], lineOptions(point, style));
    }
    case 'arrow': {
      if (!('length' in dims)) throw new Error(`expected length dims for arrow`);
      const half = dims.length / 2;
      const baseX = half - ARROWHEAD_SIZE;
      const path = `M ${-half} 0 L ${half} 0 M ${baseX} ${-ARROWHEAD_HALF_WIDTH} L ${half} 0 L ${baseX} ${ARROWHEAD_HALF_WIDTH}`;
      return new Path(path, lineOptions(point, style));
    }
  }
}
