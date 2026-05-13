import type { ToolId } from '@/pages/editor/types';
import type { BaseTool } from './BaseTool';
import { isToolRegistration } from './types';

export class ToolRegistry {
  private static tools = new Map<ToolId, BaseTool>();
  private static initialized = false;

  static init() {
    if (this.initialized) return;

    const modules = import.meta.glob('./*/*Tool.ts', {
      eager: true,
      import: 'default',
    });

    for (const mod of Object.values(modules)) {
      if (isToolRegistration(mod)) {
        this.tools.set(mod.id, mod.tool);
      }
    }

    this.initialized = true;
  }

  static get(name: ToolId): BaseTool | null {
    return this.tools.get(name) ?? null;
  }
}
