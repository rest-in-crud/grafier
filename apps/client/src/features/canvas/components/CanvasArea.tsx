import { useEffect, useState, type RefObject } from 'react';
import type { CanvasEngine } from '@/features/canvas/lib/CanvasEngine';
import type { ProjectDetail } from '@/features/projects/schema';
import { useCanvas } from '@/features/canvas/hooks/useCanvas';
import { useLayerSync } from '@/features/layers/hooks/useLayerSync';
import { useHistory } from '@/features/canvas/hooks/useHistory';
import { useLayersStore } from '@/features/layers/store/layers.store';

type Props = {
  engineRef: RefObject<CanvasEngine | null>;
  containerRef: RefObject<HTMLDivElement | null>;
  initialProject?: ProjectDetail;
  onHydrateError?: () => void;
};

export const CanvasArea = ({ engineRef, containerRef, initialProject, onHydrateError }: Props) => {
  const { canvasRef } = useCanvas(engineRef, containerRef);
  const [baselineKey, setBaselineKey] = useState(0);
  useLayerSync(engineRef);
  useHistory(engineRef, baselineKey);

  useEffect(() => {
    if (!initialProject) return;
    const engine = engineRef.current;
    if (!engine) return;

    let cancelled = false;

    const hydrate = async () => {
      engine.isRestoring = true;
      try {
        if (initialProject.canvasJSON) {
          await engine.fabricCanvas.loadFromJSON(initialProject.canvasJSON);
        }
        if (cancelled) return;
        if (initialProject.layersJSON && initialProject.layersJSON.length > 0) {
          const flatLayerObjects = initialProject.layersJSON.flatMap((l) => l.objects);
          const canvasObjects = engine.fabricCanvas.getObjects();
          canvasObjects.forEach((obj, i) => {
            if (obj.data?.id) return;
            const layerObj = flatLayerObjects[i];
            if (!layerObj) return;
            obj.data = { ...obj.data, id: layerObj.id };
          });
          useLayersStore.setState({
            layers: structuredClone(initialProject.layersJSON),
            activeLayerId: initialProject.layersJSON[0].id,
          });
        }
        engine.fabricCanvas.requestRenderAll();
        if (!cancelled) setBaselineKey((k) => k + 1);
      } catch (err) {
        console.error('canvas hydrate failed', err);
        if (!cancelled) onHydrateError?.();
      } finally {
        engine.isRestoring = false;
      }
    };

    void hydrate();

    return () => {
      cancelled = true;
    };
  }, [engineRef, initialProject, onHydrateError]);

  return (
    <div ref={containerRef} className="h-full w-full">
      <canvas ref={canvasRef} />
    </div>
  );
};
