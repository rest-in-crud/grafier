import { Canvas } from 'fabric';
import { useCanvasStore } from '@/features/canvas/store/canvas.store.ts';
import { useLayersStore } from '@/features/layers/store/layers.store.ts';
import { BaseTool } from '@/features/canvas/lib/tools/BaseTool.ts';
import { ToolRegistry } from '@/features/canvas/lib/tools/ToolRegistry.ts';

interface CanvasConfig {
  width: number;
  height: number;
  backgroundColor?: string;
}

export class CanvasEngine {
  private readonly _canvas: Canvas;
  private activeTool: BaseTool | null = null;
  private readonly unsubscribe: () => void;

  get fabricCanvas(): Canvas {
    return this._canvas;
  }

  constructor(canvasElement: HTMLCanvasElement, config: CanvasConfig) {
    this._canvas = new Canvas(canvasElement, {
      width: config.width,
      height: config.height,
      backgroundColor: config.backgroundColor || '#e5e7eb',
      selection: true,
    });

    ToolRegistry.init();

    this._canvas.on('object:added', (e) => {
      const obj = e.target;
      obj.erasable = true;

      // Skip objects that already carry an id (re-adds, internal library objects)
      if (obj.data?.id) return;

      const id = crypto.randomUUID();
      obj.data = { ...obj.data, id };

      const { activeLayerId, addObjectToLayer } = useLayersStore.getState();
      if (activeLayerId) {
        addObjectToLayer(activeLayerId, id);
      }
    });

    this._canvas.on('object:removed', (e) => {
      const id: string | undefined = e.target?.data?.id;
      if (!id) return;

      const { layers, removeObjectFromLayer } = useLayersStore.getState();
      const owningLayer = layers.find((l) => l.objectsIds.includes(id));
      if (owningLayer) {
        removeObjectFromLayer(owningLayer.id, id);
      }
    });

    this.setTool(useCanvasStore.getState().activeTool);
    this.unsubscribe = useCanvasStore.subscribe((state) => this.setTool(state.activeTool));
  }

  private setTool(toolName: string) {
    this.activeTool?.deactivate(this._canvas);
    this.activeTool = ToolRegistry.get(toolName);
    if (this.activeTool) {
      const storeStyles = useCanvasStore.getState().toolStyles[toolName] ?? {};
      const styles = { ...this.activeTool.defaultStyles, ...storeStyles };
      this.activeTool.activate(this._canvas, styles);
    }
  }

  public async destroy() {
    this.unsubscribe();
    this.activeTool?.deactivate(this._canvas);
    await this._canvas.dispose();
  }

  public resize(width: number, height: number) {
    this._canvas.setDimensions({ width, height });
    this._canvas.requestRenderAll();
  }
}
