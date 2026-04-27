import { Canvas } from 'fabric';
import { useCanvasStore } from '@/features/canvas/store/canvas.store.ts';
import { BaseTool } from '@/features/canvas/lib/tools/BaseTool.ts';
import { ToolRegistry } from '@/features/canvas/lib/tools/ToolRegistry.ts';

interface CanvasConfig {
  width: number;
  height: number;
  backgroundColor?: string;
}

export class CanvasEngine {
  private readonly canvas: Canvas;
  private activeTool: BaseTool | null = null;
  private readonly unsubscribe: () => void;

  constructor(canvasElement: HTMLCanvasElement, config: CanvasConfig) {
    this.canvas = new Canvas(canvasElement, {
      width: config.width,
      height: config.height,
      backgroundColor: config.backgroundColor || '#e5e7eb',
      selection: true,
    });
    ToolRegistry.init();
    this.setTool(useCanvasStore.getState().activeTool);
    this.unsubscribe = useCanvasStore.subscribe((state) => this.setTool(state.activeTool));
  }

  private setTool(toolName: string) {
    this.activeTool?.deactivate(this.canvas);
    this.activeTool = ToolRegistry.get(toolName);
    if (this.activeTool) {
      const storeStyles = useCanvasStore.getState().toolStyles[toolName] ?? {};
      const styles = { ...this.activeTool.defaultStyles, ...storeStyles };
      this.activeTool.activate(this.canvas, styles);
    }
  }

  public async destroy() {
    this.unsubscribe();
    this.activeTool?.deactivate(this.canvas);
    await this.canvas.dispose();
  }

  public resize(width: number, height: number) {
    this.canvas.setDimensions({ width, height })
    this.canvas.requestRenderAll();
  }
}
