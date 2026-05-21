import type { Canvas } from 'fabric';

export interface FieldSchema {
  type: string;
  label: string;
  group?: string;
  visibleWhen?: { field: string; value: unknown };
  // range / number
  min?: number;
  max?: number;
  unit?: string;
  // select / segmented
  options?: string[];
  // preset-picker
  presets?: { id: string; label: string }[];
  [key: string]: unknown;
}

export interface BaseTool {
  activate(canvas: Canvas, styles?: Record<string, unknown>): void;
  deactivate(canvas: Canvas): void;
}
