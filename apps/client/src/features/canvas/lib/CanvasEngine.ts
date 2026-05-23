import { ActiveSelection, Canvas, FabricObject, Point } from 'fabric';
import type {
  SelectionPatch,
  SelectionSnapshot,
  ToolStyles,
} from '@/features/canvas/store/canvas.store';
import type { ToolId } from '@/pages/editor/types';
import { useCanvasStore } from '@/features/canvas/store/canvas.store';
import { useLayersStore } from '@/features/layers/store/layers.store';
import { removeFromLayer } from './removeFromLayer';
import type { BaseTool } from './tools/BaseTool';
import { ToolRegistry } from './tools/ToolRegistry';

FabricObject.customProperties = ['data'];

interface CanvasConfig {
  width: number;
  height: number;
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
  private activeZoom: number = 100;
  private activeCanvasBgColor: string = '#ffffff';
  private readonly unsubscribe: () => void;
  private readonly layersUnsubscribe: () => void;
  private removingLayerObjects = false;
  private readonly objectCounter: Record<string, number> = {};
  public isRestoring = false;

  get fabricCanvas(): Canvas {
    return this.canvas;
  }

  private generateObjectName(type: string): string {
    const label = OBJECT_TYPE_LABELS[type] ?? 'Object';
    this.objectCounter[label] = (this.objectCounter[label] ?? 0) + 1;
    return `${label} ${this.objectCounter[label]}`;
  }

  public seedObjectCounterFromLayers(layers: Array<{ objects: Array<{ name: string }> }>) {
    for (const layer of layers) {
      for (const obj of layer.objects) {
        const match = obj.name.match(/^(.+?)\s+(\d+)$/);
        if (!match) continue;
        const label = match[1];
        const num = Number.parseInt(match[2], 10);
        if (Number.isNaN(num)) continue;
        this.objectCounter[label] = Math.max(this.objectCounter[label] ?? 0, num);
      }
    }
  }

  public resetObjectCounter() {
    for (const key of Object.keys(this.objectCounter)) {
      delete this.objectCounter[key];
    }
  }

  constructor(canvasElement: HTMLCanvasElement, config: CanvasConfig) {
    this.canvas = new Canvas(canvasElement, {
      width: config.width,
      height: config.height,
      selection: true,
    });
    ToolRegistry.init();

    this.canvas.on('object:added', (e) => {
      const obj = e.target;
      obj.erasable = true;
      if (this.isRestoring || obj.data?.id) return;

      const id = crypto.randomUUID();
      const name = this.generateObjectName(obj.type);
      obj.data = { ...obj.data, id };

      const { activeLayerId, addObjectToLayer } = useLayersStore.getState();
      if (activeLayerId) {
        addObjectToLayer(activeLayerId, id, name);
      }
    });

    this.canvas.on('object:removed', (e) => {
      if (this.isRestoring) return;
      removeFromLayer(e.target);
    });

    this.canvas.on('selection:created', () => this.refreshSelection());
    this.canvas.on('selection:updated', () => this.refreshSelection());
    this.canvas.on('selection:cleared', () => {
      useCanvasStore.getState().setSelection({ ids: [], primary: null });
    });
    this.canvas.on('object:modified', (e) => {
      if (e.target && this.canvas.getActiveObject() === e.target) {
        this.refreshSelection();
      }
    });

    useCanvasStore.getState().setApplyToSelection((patch) => this.applyPatchToSelection(patch));

    useCanvasStore.getState().setSelectObjectById((id) => {
      if (this.canvas.getActiveObject()?.data?.id === id) return;
      const obj = this.canvas.getObjects().find((o) => o.data?.id === id);
      if (!obj || obj.selectable === false) return;
      this.canvas.setActiveObject(obj);
      this.canvas.requestRenderAll();
      const layersState = useLayersStore.getState();
      const owningLayer = layersState.layers.find((l) => l.objects.some((o) => o.id === id));
      if (owningLayer && layersState.activeLayerId !== owningLayer.id) {
        layersState.setActiveLayer(owningLayer.id);
      }
    });

    useCanvasStore.getState().setSelectObjectsByIds((ids) => {
      const objects = this.canvas
        .getObjects()
        .filter(
          (o) =>
            typeof o.data?.id === 'string' && ids.includes(o.data.id) && o.selectable !== false,
        );
      if (objects.length === 0) {
        this.canvas.discardActiveObject();
      } else if (objects.length === 1) {
        this.canvas.setActiveObject(objects[0]);
      } else {
        const sel = new ActiveSelection(objects, { canvas: this.canvas });
        this.canvas.setActiveObject(sel);
      }
      this.canvas.requestRenderAll();
    });

    useCanvasStore.getState().setZoomToPoint((zoom, point) => {
      this.applyZoom(zoom, point);
      if (useCanvasStore.getState().zoom !== zoom) {
        useCanvasStore.getState().setZoom(zoom);
      }
    });

    useCanvasStore.getState().setDuplicateSelection(() => {
      void this.duplicateActive();
    });

    useCanvasStore.getState().setRemoveObjectById((id) => {
      const obj = this.canvas.getObjects().find((o) => o.data?.id === id);
      if (!obj) return;
      this.canvas.remove(obj);
      this.canvas.requestRenderAll();
    });

    const initial = useCanvasStore.getState();
    this.setTool(initial.activeTool, styleSliceFor(initial.activeTool, initial.toolStyles));
    this.applyZoom(initial.zoom);
    this.applyCanvasBgColor(initial.canvasBgColor);

    this.unsubscribe = useCanvasStore.subscribe((state) => {
      const nextStyles = styleSliceFor(state.activeTool, state.toolStyles);
      if (state.activeTool !== this.activeToolId) {
        this.setTool(state.activeTool, nextStyles);
      } else if (nextStyles !== this.activeToolStyles) {
        this.activeTool?.deactivate(this.canvas);
        this.activeToolStyles = nextStyles;
        this.activeTool?.activate(this.canvas, nextStyles);
      }
      if (state.zoom !== this.activeZoom) {
        this.applyZoom(state.zoom);
      }
      if (state.canvasBgColor !== this.activeCanvasBgColor) {
        this.applyCanvasBgColor(state.canvasBgColor);
      }
    });

    let prevLayerObjectIds = new Map<string, Set<string>>(
      useLayersStore.getState().layers.map((l) => [l.id, new Set(l.objects.map((o) => o.id))]),
    );
    this.layersUnsubscribe = useLayersStore.subscribe((state) => {
      if (this.removingLayerObjects) return;
      const currentLayerIds = new Set(state.layers.map((l) => l.id));
      this.removingLayerObjects = true;
      try {
        for (const [prevLayerId, objectIds] of prevLayerObjectIds) {
          if (currentLayerIds.has(prevLayerId)) continue;
          const toRemove = this.canvas.getObjects().filter((o) => {
            const id = o.data?.id;
            return typeof id === 'string' && objectIds.has(id);
          });
          for (const obj of toRemove) this.canvas.remove(obj);
        }
      } finally {
        this.removingLayerObjects = false;
      }
      prevLayerObjectIds = new Map(
        state.layers.map((l) => [l.id, new Set(l.objects.map((o) => o.id))]),
      );
    });
  }

  private refreshSelection(): void {
    const objects = this.canvas.getActiveObjects();
    const nextIds = objects
      .map((o) => (typeof o.data?.id === 'string' ? o.data.id : null))
      .filter((id): id is string => id !== null);
    const prev = useCanvasStore.getState().selection.ids;
    const idsUnchanged = prev.length === nextIds.length && prev.every((id, i) => id === nextIds[i]);
    const ids = idsUnchanged ? prev : nextIds;
    const primary = objects.length === 1 ? projectSelection(objects[0]) : null;
    useCanvasStore.getState().setSelection({ ids, primary });
    if (objects.length === 1) {
      const id = nextIds[0];
      const layersState = useLayersStore.getState();
      const owningLayer = layersState.layers.find((l) => l.objects.some((o) => o.id === id));
      if (owningLayer && layersState.activeLayerId !== owningLayer.id) {
        layersState.setActiveLayer(owningLayer.id);
      }
    }
  }

  private async duplicateActive(): Promise<void> {
    const active = this.canvas.getActiveObject();
    if (!active) return;

    if (!(active instanceof ActiveSelection)) {
      const clone = await active.clone();
      clone.set({ left: (active.left ?? 0) + 10, top: (active.top ?? 0) + 10 });
      this.canvas.add(clone);
      this.canvas.setActiveObject(clone);
      this.canvas.requestRenderAll();
      return;
    }

    const children = [...active.getObjects()];
    this.canvas.discardActiveObject();
    const clones: FabricObject[] = [];
    for (const child of children) {
      const clone = await child.clone();
      clone.set({ left: (clone.left ?? 0) + 10, top: (clone.top ?? 0) + 10 });
      this.canvas.add(clone);
      clones.push(clone);
    }
    const next = new ActiveSelection(clones, { canvas: this.canvas });
    this.canvas.setActiveObject(next);
    this.canvas.requestRenderAll();
  }

  private applyCanvasBgColor(color: string) {
    this.activeCanvasBgColor = color;
    this.canvas.set('backgroundColor', color);
    this.canvas.requestRenderAll();
  }

  private applyZoom(zoom: number, point?: Point) {
    this.activeZoom = zoom;
    const focus = point ?? new Point(this.canvas.getWidth() / 2, this.canvas.getHeight() / 2);
    this.canvas.zoomToPoint(focus, zoom / 100);
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
    this.canvas.fire('object:modified', { target: obj });
    this.refreshSelection();
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
    this.layersUnsubscribe();
    useCanvasStore.getState().setApplyToSelection(() => {});
    useCanvasStore.getState().setSelectObjectById(() => {});
    useCanvasStore.getState().setSelectObjectsByIds(() => {});
    useCanvasStore.getState().setZoomToPoint(() => {});
    useCanvasStore.getState().setDuplicateSelection(() => {});
    useCanvasStore.getState().setRemoveObjectById(() => {});
    useCanvasStore.getState().setSelection({ ids: [], primary: null });
    this.activeTool?.deactivate(this.canvas);
    await this.canvas.dispose();
  }

  public resize(width: number, height: number) {
    this.canvas.setDimensions({ width, height });
    this.canvas.requestRenderAll();
  }
}
