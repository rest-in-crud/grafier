import type { BaseTool } from './BaseTool';
import type { ToolId } from '@/pages/editor/types';

export interface ToolRegistration {
  id: ToolId;
  tool: BaseTool;
}

export function isToolRegistration(mod: unknown): mod is ToolRegistration {
  if (typeof mod !== 'object' || mod === null) return false;
  if (!('id' in mod) || !('tool' in mod)) return false;
  if (typeof mod.id !== 'string') return false;
  const { tool } = mod;
  if (typeof tool !== 'object' || tool === null) return false;
  return (
    'activate' in tool &&
    'deactivate' in tool &&
    typeof tool.activate === 'function' &&
    typeof tool.deactivate === 'function'
  );
}
