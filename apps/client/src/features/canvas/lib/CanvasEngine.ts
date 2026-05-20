import { Canvas } from 'fabric';
import type { ToolId } from '@/pages/editor/types';
import type { ToolStyles } from '@/features/canvas/store/canvas.store';
import { useCanvasStore } from '@/features/canvas/store/canvas.store';
import { useLayersStore } from '@/features/layers/store/layers.store';
import type { BaseTool } from './tools/BaseTool';
import { ToolRegistry } from './tools/ToolRegistry';

interface CanvasConfig {
  width: number;
  height: number;
  backgroundColor?: string;
}

const OBJECT_TYPE_LABELS: Record<string, string> = {
  rect: 'Rectangle',
  circle: 'Circle',
  ellipse: 'Ellipse',
  triangle: 'Triangle',
  line: 'Line',
  path: 'Pen Stroke',
  'i-text': 'Text',
};

function styleSliceFor(
  toolId: ToolId,
  toolStyles: ToolStyles,
): Record<string, unknown> | undefined {
  switch (toolId) {
    case 'pencil':
      return toolStyles.pencil;
    case 'eraser':
      return toolStyles.eraser;
    case 'text':
      return toolStyles.text;
    case 'shape':
      return toolStyles.shape;
    default:
      return undefined;
  }
}

export class CanvasEngine {
  private readonly canvas: Canvas;
  private activeTool: BaseTool | null = null;
  private activeToolId: ToolId | null = null;
  private activeToolStyles: Record<string, unknown> | undefined = undefined;
  private readonly unsubscribe: () => void;
  private readonly objectCounter: Record<string, number> = {};

  get fabricCanvas(): Canvas {
    return this.canvas;
  }

  private generateObjectName(type: string): string {
    const label = OBJECT_TYPE_LABELS[type] ?? 'Object';
    this.objectCounter[label] = (this.objectCounter[label] ?? 0) + 1;
    return `${label} ${this.objectCounter[label]}`;
  }

  constructor(canvasElement: HTMLCanvasElement, config: CanvasConfig) {
    this.canvas = new Canvas(canvasElement, {
      width: config.width,
      height: config.height,
      backgroundColor: config.backgroundColor ?? 'transparent',
      selection: true,
    });
    ToolRegistry.init();

    this.canvas.on('object:added', (e) => {
      const obj = e.target;
      obj.erasable = true;
      if (obj.data?.id) return;

      const id = crypto.randomUUID();
      const name = this.generateObjectName(obj.type);
      obj.data = { ...obj.data, id };

      const { activeLayerId, addObjectToLayer } = useLayersStore.getState();
      if (activeLayerId) {
        addObjectToLayer(activeLayerId, id, name);
      }
    });

    this.canvas.on('object:removed', (e) => {
      const id = e.target?.data?.id;
      if (!id) return;
      const { layers, removeObjectFromLayer } = useLayersStore.getState();
      const owningLayer = layers.find((l) => l.objects.some((o) => o.id === id));
      if (owningLayer) {
        removeObjectFromLayer(owningLayer.id, id);
      }
    });

    const initial = useCanvasStore.getState();
    this.setTool(initial.activeTool, styleSliceFor(initial.activeTool, initial.toolStyles));

    this.unsubscribe = useCanvasStore.subscribe((state) => {
      const nextStyles = styleSliceFor(state.activeTool, state.toolStyles);
      if (state.activeTool !== this.activeToolId) {
        this.setTool(state.activeTool, nextStyles);
        return;
      }
      if (nextStyles !== this.activeToolStyles) {
        this.activeTool?.deactivate(this.canvas);
        this.activeToolStyles = nextStyles;
        this.activeTool?.activate(this.canvas, nextStyles);
      }
    });
  }

  private setTool(toolId: ToolId, styles: Record<string, unknown> | undefined) {
    this.activeTool?.deactivate(this.canvas);
    this.activeTool = ToolRegistry.get(toolId);
    this.activeToolId = toolId;
    this.activeToolStyles = styles;
    this.activeTool?.activate(this.canvas, styles);
  }

  public async destroy() {
    this.unsubscribe();
    this.activeTool?.deactivate(this.canvas);
    await this.canvas.dispose();
  }

  public resize(width: number, height: number) {
    this.canvas.setDimensions({ width, height });
    this.canvas.requestRenderAll();
  }
}
