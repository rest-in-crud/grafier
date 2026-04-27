import { Canvas } from 'fabric';

export interface FieldSchema {
  type: string;
  label: string;
  [key: string]: unknown;
}

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
