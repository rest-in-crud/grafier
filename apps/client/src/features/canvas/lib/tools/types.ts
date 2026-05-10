import { BaseTool } from './BaseTool';

export interface ToolRegistration {
  id: string;
  tool: BaseTool;
}

export function isToolRegistration(mod: unknown): mod is ToolRegistration {
  return (
    typeof mod === 'object' &&
    mod !== null &&
    'id' in mod &&
    'tool' in mod &&
    typeof (mod as Record<string, unknown>).id === 'string'
  );
}
