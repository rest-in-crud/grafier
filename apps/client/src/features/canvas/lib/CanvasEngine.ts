import { Canvas } from 'fabric';
import type { FabricObject } from 'fabric';
import type { ToolId } from '@/pages/editor/types';
import type {
  SelectionPatch,
  SelectionSnapshot,
  ToolStyles,
} from '@/features/canvas/store/canvas.store';
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

function projectSelection(obj: FabricObject): SelectionSnapshot {
  return {
    id: typeof obj.data?.id === 'string' ? obj.data.id : '',
    type: obj.type,
    left: Math.round(obj.left ?? 0),
    top: Math.round(obj.top ?? 0),
    width: Math.round(obj.getScaledWidth()),
    height: Math.round(obj.getScaledHeight()),
    angle: Math.round(obj.angle ?? 0),
    opacity: obj.opacity ?? 1,
    fill: typeof obj.fill === 'string' ? obj.fill : null,
    stroke: typeof obj.stroke === 'string' ? obj.stroke : null,
    strokeWidth: obj.strokeWidth ?? 0,
  };
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

    const refreshSelection = () => {
      const objects = this.canvas.getActiveObjects();
      if (objects.length !== 1) {
        useCanvasStore.getState().setSelection(null);
        return;
      }
      useCanvasStore.getState().setSelection(projectSelection(objects[0]));
    };

    this.canvas.on('selection:created', refreshSelection);
    this.canvas.on('selection:updated', refreshSelection);
    this.canvas.on('selection:cleared', () => {
      useCanvasStore.getState().setSelection(null);
    });
    this.canvas.on('object:modified', (e) => {
      if (e.target && this.canvas.getActiveObject() === e.target) {
        refreshSelection();
      }
    });

    useCanvasStore.getState().setApplyToSelection((patch) => this.applyPatchToSelection(patch));

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

  private applyPatchToSelection(patch: SelectionPatch) {
    const obj = this.canvas.getActiveObject();
    if (!obj) return;

    if (patch.width !== undefined && obj.width) {
      obj.set('scaleX', patch.width / obj.width);
    }
    if (patch.height !== undefined && obj.height) {
      obj.set('scaleY', patch.height / obj.height);
    }
    if (patch.left !== undefined) obj.set('left', patch.left);
    if (patch.top !== undefined) obj.set('top', patch.top);
    if (patch.angle !== undefined) obj.set('angle', patch.angle);
    if (patch.opacity !== undefined) obj.set('opacity', patch.opacity);
    if (patch.fill !== undefined) obj.set('fill', patch.fill);
    if (patch.stroke !== undefined) obj.set('stroke', patch.stroke);
    if (patch.strokeWidth !== undefined) obj.set('strokeWidth', patch.strokeWidth);

    obj.setCoords();
    this.canvas.requestRenderAll();
    useCanvasStore.getState().setSelection(projectSelection(obj));
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
    useCanvasStore.getState().setApplyToSelection(() => {});
    useCanvasStore.getState().setSelection(null);
    this.activeTool?.deactivate(this.canvas);
    await this.canvas.dispose();
  }

  public resize(width: number, height: number) {
    this.canvas.setDimensions({ width, height });
    this.canvas.requestRenderAll();
  }
}
