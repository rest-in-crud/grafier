import type { CanvasEngine } from '@/features/canvas/lib/CanvasEngine';
import { queryClient } from '@/shared/lib/query-client';
import { api as projectsApi } from '@/features/projects/api';
import { designsKeys } from '@/features/projects/query-keys';
import { useLayersStore } from '@/features/layers/store/layers.store';
import { useHistoryStore } from '@/features/canvas/store/history.store';
import { useCanvasStore } from '@/features/canvas/store/canvas.store';
import { loadCanvasTextFonts } from '@/features/canvas/lib/tools/TextTool/fontLoader';

const readSavedBgColor = (canvasJSON: Record<string, unknown>): string | null => {
  const bg = canvasJSON.background;
  if (typeof bg === 'string' && bg.length > 0) return bg;
  const bgColor = canvasJSON.backgroundColor;
  if (typeof bgColor === 'string' && bgColor.length > 0) return bgColor;
  return null;
};

const reloadFromDesign = async (engine: CanvasEngine, designId: string): Promise<void> => {
  const detail = await queryClient.fetchQuery({
    queryKey: designsKeys.detail(designId),
    queryFn: () => projectsApi.get(designId),
    staleTime: 0,
  });

  engine.isRestoring = true;
  try {
    const canvas = engine.fabricCanvas;

    engine.resize(detail.width, detail.height);
    useCanvasStore.setState({ artboardWidth: detail.width, artboardHeight: detail.height });

    if (detail.canvasJSON) {
      await canvas.loadFromJSON(detail.canvasJSON);
      await loadCanvasTextFonts(canvas);

      const savedBg = readSavedBgColor(detail.canvasJSON);
      if (savedBg !== null) {
        canvas.backgroundColor = savedBg;
        useCanvasStore.setState({ canvasBgColor: savedBg });
      }
    }

    const layers = detail.layersJSON;
    if (layers && layers.length > 0) {
      const flatLayerObjects = layers.flatMap((l) => l.objects);
      const canvasObjects = canvas.getObjects();
      canvasObjects.forEach((obj, i) => {
        if (obj.data?.id) return;
        const layerObj = flatLayerObjects[i];
        if (!layerObj) return;
        obj.data = { ...obj.data, id: layerObj.id };
      });
      useLayersStore.setState({
        layers: structuredClone(layers),
        activeLayerId: layers[0].id,
      });
      engine.seedObjectCounterFromLayers(layers);
    } else {
      const defaultLayer = {
        id: crypto.randomUUID(),
        name: 'Layer 1',
        visible: true,
        locked: false,
        opacity: 1,
        objects: [],
        collapsed: false,
      };
      useLayersStore.setState({
        layers: [defaultLayer],
        activeLayerId: defaultLayer.id,
      });
      engine.resetObjectCounter();
    }

    canvas.requestRenderAll();

    /* clear undo and redo so the post-restore canvas is the new baseline */
    useHistoryStore.setState({ past: [], future: [] });
  } finally {
    engine.isRestoring = false;
  }
};

export { reloadFromDesign };
