import type { FieldSchema } from '@/features/canvas/lib/tools/BaseTool';

export const PEN_DEFAULT_STYLES: PenStyles = {
  // General
  brushType: 'pencil',
  color: '#000000',
  width: 5,
  opacity: 100,
  limitedToCanvasSize: false,
  // Line (Pencil only)
  strokeLineCap: 'round',
  strokeLineJoin: 'round',
  strokeMiterLimit: 10,
  strokeDashArray: 'solid',
  // Shadow
  shadowColor: '#000000',
  shadowBlur: 0,
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  // Spray specific
  density: 20,
  dotWidth: 1,
  dotWidthVariance: 1,
  randomOpacity: false,
  // Pencil specific
  straightLineKey: 'none',
};

export const DASH_PRESETS: Record<string, number[] | null> = {
  solid: null,
  dashed: [15, 10],
  dotted: [3, 6],
  'long-dash': [25, 10],
  'dash-dot': [15, 5, 3, 5],
};

export const PEN_STYLE_SCHEMA: Record<string, FieldSchema> = {
  // ── General ─────────────────────────────────────────────────────────────
  brushType: {
    type: 'segmented',
    label: 'Brush',
    group: 'General',
    options: ['pencil', 'spray'],
  },
  color: { type: 'color', label: 'Color', group: 'General' },
  width: { type: 'range', label: 'Width', group: 'General', min: 1, max: 150, unit: 'px' },
  opacity: { type: 'range', label: 'Opacity', group: 'General', min: 0, max: 100, unit: '%' },
  limitedToCanvasSize: { type: 'toggle', label: 'Limit to Canvas', group: 'General' },

  // ── Line (Pencil only) ───────────────────────────────────────────────────
  strokeLineCap: {
    type: 'segmented',
    label: 'Cap',
    group: 'Line',
    options: ['butt', 'round', 'square'],
    visibleWhen: { field: 'brushType', value: 'pencil' },
  },
  strokeLineJoin: {
    type: 'segmented',
    label: 'Join',
    group: 'Line',
    options: ['bevel', 'round', 'miter'],
    visibleWhen: { field: 'brushType', value: 'pencil' },
  },
  strokeMiterLimit: {
    type: 'number',
    label: 'Miter',
    group: 'Line',
    min: 1,
    max: 500,
    visibleWhen: { field: 'brushType', value: 'pencil' },
  },
  strokeDashArray: {
    type: 'preset-picker',
    label: 'Dash',
    group: 'Line',
    presets: [
      { id: 'solid', label: '——' },
      { id: 'dashed', label: '– –' },
      { id: 'dotted', label: '···' },
      { id: 'long-dash', label: '—— ——' },
      { id: 'dash-dot', label: '—·—' },
    ],
    visibleWhen: { field: 'brushType', value: 'pencil' },
  },

  // ── Shadow ───────────────────────────────────────────────────────────────
  shadowColor: { type: 'color', label: 'Color', group: 'Shadow' },
  shadowBlur: { type: 'range', label: 'Blur', group: 'Shadow', min: 0, max: 50 },
  shadowOffsetX: { type: 'number', label: 'Offset X', group: 'Shadow', min: -100, max: 100 },
  shadowOffsetY: { type: 'number', label: 'Offset Y', group: 'Shadow', min: -100, max: 100 },

  // ── Spray specific ───────────────────────────────────────────────────────
  density: {
    type: 'range',
    label: 'Density',
    group: 'Spray',
    min: 1,
    max: 100,
    visibleWhen: { field: 'brushType', value: 'spray' },
  },
  dotWidth: {
    type: 'range',
    label: 'Dot Width',
    group: 'Spray',
    min: 1,
    max: 20,
    visibleWhen: { field: 'brushType', value: 'spray' },
  },
  dotWidthVariance: {
    type: 'range',
    label: 'Dot Variance',
    group: 'Spray',
    min: 0,
    max: 10,
    visibleWhen: { field: 'brushType', value: 'spray' },
  },
  randomOpacity: {
    type: 'toggle',
    label: 'Random Opacity',
    group: 'Spray',
    visibleWhen: { field: 'brushType', value: 'spray' },
  },

  // ── Pencil specific ──────────────────────────────────────────────────────
  straightLineKey: {
    type: 'select',
    label: 'Straight Key',
    group: 'Pencil',
    options: ['none', 'altKey', 'shiftKey', 'ctrlKey'],
    visibleWhen: { field: 'brushType', value: 'pencil' },
  },
};

export type StrokeLineCap = 'butt' | 'round' | 'square';
export type StrokeLineJoin = 'bevel' | 'round' | 'miter';
export type ModifierKey = 'altKey' | 'shiftKey' | 'ctrlKey' | 'none';

export interface PenStyles {
  color: string;
  opacity: number;
  width: number;
  brushType: 'pencil' | 'spray';
  limitedToCanvasSize: boolean;
  strokeLineCap: StrokeLineCap;
  strokeLineJoin: StrokeLineJoin;
  strokeMiterLimit: number;
  strokeDashArray: string;
  straightLineKey: ModifierKey;
  density: number;
  dotWidth: number;
  dotWidthVariance: number;
  randomOpacity: boolean;
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
}
