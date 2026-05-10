import { BaseTool } from '@/features/canvas/lib/tools/BaseTool.ts';
import {isToolRegistration } from '@/features/canvas/lib/tools/types.ts';

export class ToolRegistry {
  private static tools = new Map<string, BaseTool>();
  private static initialized = false;

  static init() {
    if (this.initialized) return;

    const modules = import.meta.glob(['./*Tool.ts', '!./BaseTool.ts', '!./ToolRegistry.ts'], {
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

  static get(name: string): BaseTool | null {
    return this.tools.get(name) ?? null;
  }
}
