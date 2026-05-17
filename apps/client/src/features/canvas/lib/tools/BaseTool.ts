import { Canvas } from 'fabric';

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
  
export interface BaseTool {
  activate(canvas: Canvas, styles?: Record<string, unknown>): void;
  deactivate(canvas: Canvas): void;
  defaultStyles?: Record<string, unknown>;
  styleSchema?: Record<string, FieldSchema>;
}

export interface ToolRegistration {
  id: string;
  tool: BaseTool;
}

export function isToolRegistration(mod: unknown): mod is ToolRegistration {
  return (
    typeof mod === 'object' &&
    mod !== null &&
    'id' in mod &&
    typeof mod.id === 'string' &&
    'tool' in mod
  );
}
