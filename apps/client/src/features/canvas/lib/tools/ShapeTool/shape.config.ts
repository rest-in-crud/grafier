import { Circle, Ellipse, Line, Path, Polygon, Rect, Triangle, type Point } from 'fabric';
import type { FabricObject } from 'fabric';

export type ShapeType =
  | 'rect'
  | 'square'
  | 'rounded-rect'
  | 'circle'
  | 'ellipse'
  | 'triangle'
  | 'diamond'
  | 'pentagon'
  | 'hexagon'
  | 'star'
  | 'line'
  | 'arrow';

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
  'rounded-rect': { width: 120, height: 80 },
  circle: { radius: 50 },
  ellipse: { rx: 70, ry: 45 },
  triangle: { width: 110, height: 100 },
  diamond: { width: 100, height: 100 },
  pentagon: { width: 100, height: 100 },
  hexagon: { width: 100, height: 100 },
  star: { width: 100, height: 100 },
  line: { length: 140 },
  arrow: { length: 140 },
};

export const ARROWHEAD_SIZE = 22;
export const ARROWHEAD_HALF_WIDTH = 14;

const POLYGON_BASE_SIZE = 100;
const SCALE_SHAPES = new Set<ShapeType>(['diamond', 'pentagon', 'hexagon', 'star']);

const regularPolygon = (sides: number, radius: number): Array<{ x: number; y: number }> =>
  Array.from({ length: sides }, (_, i) => {
    const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
    return { x: radius * Math.cos(angle), y: radius * Math.sin(angle) };
  });

const buildStarPath = (outerR: number, innerR: number, numPoints: number = 5): string => {
  const stepAngle = Math.PI / numPoints;
  const startAngle = -Math.PI / 2;
  return (
    Array.from({ length: numPoints * 2 }, (_, i) => {
      const r = i % 2 === 0 ? outerR : innerR;
      const angle = startAngle + i * stepAngle;
      const cmd = i === 0 ? 'M' : 'L';
      return `${cmd} ${r * Math.cos(angle)} ${r * Math.sin(angle)}`;
    }).join(' ') + ' Z'
  );
};

export const SHAPE_OPTIONS: ShapeOption[] = [
  { type: 'rect', label: 'Rect' },
  { type: 'square', label: 'Square' },
  { type: 'rounded-rect', label: 'Rounded' },
  { type: 'circle', label: 'Circle' },
  { type: 'ellipse', label: 'Ellipse' },
  { type: 'triangle', label: 'Triangle' },
  { type: 'diamond', label: 'Diamond' },
  { type: 'pentagon', label: 'Pentagon' },
  { type: 'hexagon', label: 'Hexagon' },
  { type: 'star', label: 'Star' },
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

const buildArrowPath = (startX: number, startY: number, endX: number, endY: number): string => {
  const dx = endX - startX;
  const dy = endY - startY;
  const len = Math.hypot(dx, dy);
  if (len === 0) {
    return `M ${startX} ${startY} L ${endX} ${endY}`;
  }
  const ux = dx / len;
  const uy = dy / len;
  const px = -uy;
  const py = ux;
  const baseX = endX - ux * ARROWHEAD_SIZE;
  const baseY = endY - uy * ARROWHEAD_SIZE;
  const leftX = baseX + px * ARROWHEAD_HALF_WIDTH;
  const leftY = baseY + py * ARROWHEAD_HALF_WIDTH;
  const rightX = baseX - px * ARROWHEAD_HALF_WIDTH;
  const rightY = baseY - py * ARROWHEAD_HALF_WIDTH;
  return `M ${startX} ${startY} L ${endX} ${endY} M ${rightX} ${rightY} L ${endX} ${endY} L ${leftX} ${leftY}`;
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

export type ShapeModifiers = { shift: boolean; alt: boolean };

export function createShapeObject(
  type: ShapeType,
  point: ShapePoint,
  style: ShapeStyle = type === 'line' || type === 'arrow' ? LINE_SHAPE_STYLE : CLOSED_SHAPE_STYLE,
): FabricObject {
  const dims = DEFAULT_SHAPE_DIMENSIONS[type];
  switch (type) {
    case 'rect':
    case 'square':
    case 'rounded-rect':
    case 'triangle': {
      if (!('width' in dims)) throw new Error(`expected width/height dims for ${type}`);
      const opts = { ...closedOptions(point, style), width: dims.width, height: dims.height };
      if (type === 'triangle') return new Triangle(opts);
      if (type === 'rounded-rect') return new Rect({ ...opts, rx: 12, ry: 12 });
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
    case 'diamond': {
      return new Polygon(
        [{ x: 0, y: -50 }, { x: 50, y: 0 }, { x: 0, y: 50 }, { x: -50, y: 0 }],
        closedOptions(point, style),
      );
    }
    case 'pentagon': {
      return new Polygon(regularPolygon(5, 50), closedOptions(point, style));
    }
    case 'hexagon': {
      return new Polygon(regularPolygon(6, 50), closedOptions(point, style));
    }
    case 'star': {
      return new Path(buildStarPath(50, 20), { ...closedOptions(point, style), strokeLineJoin: 'miter' as const });
    }
    case 'line': {
      if (!('length' in dims)) throw new Error(`expected length dims for line`);
      const half = dims.length / 2;
      return new Line([-half, 0, half, 0], lineOptions(point, style));
    }
    case 'arrow': {
      if (!('length' in dims)) throw new Error(`expected length dims for arrow`);
      const half = dims.length / 2;
      return new Path(buildArrowPath(-half, 0, half, 0), lineOptions(point, style));
    }
  }
}

const resizeClosed = (
  shape: FabricObject,
  type: ShapeType,
  start: Point,
  current: Point,
  modifiers: ShapeModifiers,
): void => {
  let dx = current.x - start.x;
  let dy = current.y - start.y;

  if (modifiers.shift) {
    const s = Math.max(Math.abs(dx), Math.abs(dy));
    dx = (dx === 0 ? 1 : Math.sign(dx)) * s;
    dy = (dy === 0 ? 1 : Math.sign(dy)) * s;
  }

  const absW = Math.abs(dx);
  const absH = Math.abs(dy);

  if (modifiers.alt) {
    const finalW = absW * 2;
    const finalH = absH * 2;
    if (type === 'circle') {
      shape.set({ left: start.x, top: start.y, radius: Math.max(finalW, finalH) / 2 });
    } else if (type === 'ellipse') {
      shape.set({ left: start.x, top: start.y, rx: finalW / 2, ry: finalH / 2 });
    } else if (SCALE_SHAPES.has(type)) {
      const baseW = shape.width || POLYGON_BASE_SIZE;
      const baseH = shape.height || POLYGON_BASE_SIZE;
      shape.set({ left: start.x, top: start.y, scaleX: finalW / baseW, scaleY: finalH / baseH });
    } else {
      shape.set({ left: start.x, top: start.y, width: finalW, height: finalH });
    }
  } else {
    const cx = start.x + dx / 2;
    const cy = start.y + dy / 2;
    if (type === 'circle') {
      shape.set({ left: cx, top: cy, radius: Math.max(absW, absH) / 2 });
    } else if (type === 'ellipse') {
      shape.set({ left: cx, top: cy, rx: absW / 2, ry: absH / 2 });
    } else if (SCALE_SHAPES.has(type)) {
      const baseW = shape.width || POLYGON_BASE_SIZE;
      const baseH = shape.height || POLYGON_BASE_SIZE;
      shape.set({ left: cx, top: cy, scaleX: absW / baseW, scaleY: absH / baseH });
    } else {
      shape.set({ left: cx, top: cy, width: absW, height: absH });
    }
  }
  shape.setCoords();
};

const resizeLineLike = (
  shape: FabricObject,
  type: ShapeType,
  start: Point,
  current: Point,
  modifiers: ShapeModifiers,
): void => {
  let endX = current.x;
  let endY = current.y;

  if (modifiers.shift) {
    const angle = Math.atan2(current.y - start.y, current.x - start.x);
    const snapped = Math.round(angle / (Math.PI / 4)) * (Math.PI / 4);
    const dist = Math.hypot(current.x - start.x, current.y - start.y);
    endX = start.x + Math.cos(snapped) * dist;
    endY = start.y + Math.sin(snapped) * dist;
  }

  const anchorX = modifiers.alt ? 2 * start.x - endX : start.x;
  const anchorY = modifiers.alt ? 2 * start.y - endY : start.y;

  if (type === 'line') {
    shape.set({ x1: anchorX, y1: anchorY, x2: endX, y2: endY });
    shape.setCoords();
    return;
  }
  if ('_setPath' in shape && typeof shape._setPath === 'function') {
    shape._setPath(buildArrowPath(anchorX, anchorY, endX, endY), false);
  }
  shape.setCoords();
};

export const resizeShape = (
  shape: FabricObject,
  type: ShapeType,
  start: Point,
  current: Point,
  modifiers: ShapeModifiers,
): void => {
  if (type === 'line' || type === 'arrow') {
    resizeLineLike(shape, type, start, current, modifiers);
  } else {
    resizeClosed(shape, type, start, current, modifiers);
  }
};

export const applyDimensions = (
  shape: FabricObject,
  type: ShapeType,
  origin: Point,
  dims: ShapeDimensions,
): void => {
  if ('radius' in dims) {
    shape.set({ left: origin.x, top: origin.y, radius: dims.radius });
  } else if ('rx' in dims) {
    shape.set({ left: origin.x, top: origin.y, rx: dims.rx, ry: dims.ry });
  } else if ('length' in dims) {
    const half = dims.length / 2;
    if (type === 'line') {
      shape.set({ x1: origin.x - half, y1: origin.y, x2: origin.x + half, y2: origin.y });
    } else {
      shape.set({ left: origin.x, top: origin.y });
      if ('_setPath' in shape && typeof shape._setPath === 'function') {
        shape._setPath(buildArrowPath(-half, 0, half, 0), false);
      }
    }
  } else if (SCALE_SHAPES.has(type)) {
    const baseW = shape.width || POLYGON_BASE_SIZE;
    const baseH = shape.height || POLYGON_BASE_SIZE;
    shape.set({ left: origin.x, top: origin.y, scaleX: dims.width / baseW, scaleY: dims.height / baseH });
  } else {
    shape.set({ left: origin.x, top: origin.y, width: dims.width, height: dims.height });
  }
  shape.setCoords();
};
