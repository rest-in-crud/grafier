import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import type { CanvasEngine } from '@/features/canvas/lib/CanvasEngine';
import { useSaveStatusStore } from '@/features/projects/store/save-status.store';
import { useReadOnlyStore } from '@/features/projects/store/read-only.store';
import { useVersionUiStore } from '@/features/versions/store/version-ui.store';
import { useLayersStore } from '@/features/layers/store/layers.store';
import { useSaveVersion } from '@/features/versions/queries';
import { buildAutoLabel } from '@/features/versions/lib/version-labels';
import { useCanvasStore } from '@/features/canvas/store/canvas.store';
import { saveCanvasRequestSchema } from '@/features/projects/schema';

const AUTO_VERSION_INTERVAL_MS = 5 * 60 * 1000;

const useAutoVersionTimer = (designId: string, engineRef: RefObject<CanvasEngine | null>) => {
  const saveVersion = useSaveVersion(designId);
  const saveVersionRef = useRef(saveVersion);

  useEffect(() => {
    saveVersionRef.current = saveVersion;
  });

  useEffect(() => {
    const tick = async () => {
      if (useReadOnlyStore.getState().isReadOnly) return;
      const engine = engineRef.current;
      if (!engine) return;
      const status = useSaveStatusStore.getState().status;
      if (status.tag !== 'dirty') return;
      const lastAt = useVersionUiStore.getState().lastAutoVersionAt;
      if (Date.now() - lastAt < AUTO_VERSION_INTERVAL_MS) return;
      try {
        const canvasJSON = saveCanvasRequestSchema.shape.canvasJSON.parse(
          engine.fabricCanvas.toJSON(),
        );
        const layersJSON = useLayersStore.getState().layers;
        const { artboardWidth, artboardHeight } = useCanvasStore.getState();
        await saveVersionRef.current.mutateAsync({
          label: buildAutoLabel(new Date()),
          canvasJSON,
          layersJSON,
          width: artboardWidth,
          height: artboardHeight,
        });
        useVersionUiStore.getState().markAutoVersionSaved();
      } catch {
        /* silent: autosave still protects current state */
      }
    };
    const interval = setInterval(() => {
      void tick();
    }, AUTO_VERSION_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [engineRef]);
};

export { useAutoVersionTimer };
