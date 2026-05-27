import type { FieldSchema } from '../BaseTool';

export interface BrushStyles {
  color: string;
  width: number;
  opacity: number;
  smoothing: number;
  limitedToCanvasSize: boolean;
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
}

export const BRUSH_DEFAULT_STYLES: BrushStyles = {
  color: '#000000',
  width: 20,
  opacity: 100,
  smoothing: 5,
  limitedToCanvasSize: false,
  shadowColor: '#000000',
  shadowBlur: 0,
  shadowOffsetX: 0,
  shadowOffsetY: 0,
};

export const BRUSH_STYLE_SCHEMA: Record<string, FieldSchema> = {
  color: { type: 'color', label: 'Color', group: 'General' },
  width: { type: 'range', label: 'Size', group: 'General', min: 1, max: 200, unit: 'px' },
  opacity: { type: 'range', label: 'Opacity', group: 'General', min: 0, max: 100, unit: '%' },
  smoothing: { type: 'range', label: 'Smoothing', group: 'General', min: 0, max: 15 },
  limitedToCanvasSize: { type: 'toggle', label: 'Limit to Canvas', group: 'General' },
  shadowColor: { type: 'color', label: 'Color', group: 'Shadow' },
  shadowBlur: { type: 'range', label: 'Blur', group: 'Shadow', min: 0, max: 50 },
  shadowOffsetX: { type: 'number', label: 'Offset X', group: 'Shadow', min: -100, max: 100 },
  shadowOffsetY: { type: 'number', label: 'Offset Y', group: 'Shadow', min: -100, max: 100 },
};
