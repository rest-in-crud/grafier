import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { useHistoryStore } from '@/features/canvas/store/history.store';
import { useLayersStore } from '@/features/layers/store/layers.store';
import { useSaveStatusStore } from '@/features/projects/store/save-status.store';
import { useSaveCanvas } from '@/features/projects/queries';
import { HttpError } from '@/shared/lib/api-client';
import { saveCanvasRequestSchema } from '@/features/projects/schema';
import type { CanvasEngine } from '@/features/canvas/lib/CanvasEngine';

const DEBOUNCE_MS = 2000;

const useAutosave = (projectId: string, engineRef: RefObject<CanvasEngine | null>) => {
  const saveMutation = useSaveCanvas(projectId);
  const markDirty = useSaveStatusStore((s) => s.markDirty);
  const markSaving = useSaveStatusStore((s) => s.markSaving);
  const markIdle = useSaveStatusStore((s) => s.markIdle);
  const markError = useSaveStatusStore((s) => s.markError);
  const markFatal = useSaveStatusStore((s) => s.markFatal);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const unsubHistory = useHistoryStore.subscribe((s, prev) => {
      if (engineRef.current?.isRestoring) return;
      if (s.past !== prev.past) markDirty();
    });
    const unsubLayers = useLayersStore.subscribe((s, prev) => {
      if (engineRef.current?.isRestoring) return;
      if (s.layers !== prev.layers) markDirty();
    });
    return () => {
      unsubHistory();
      unsubLayers();
    };
  }, [engineRef, markDirty]);

  useEffect(() => {
    return useSaveStatusStore.subscribe((s) => {
      if (s.status.tag !== 'dirty') return;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        const engine = engineRef.current;
        if (!engine) return;
        markSaving();
        const canvasJSON = saveCanvasRequestSchema.shape.canvasJSON.parse(
          engine.fabricCanvas.toJSON(),
        );
        const layersJSON = useLayersStore.getState().layers;
        saveMutation.mutate(
          { canvasJSON, layersJSON },
          {
            onSuccess: () => {
              if (useSaveStatusStore.getState().projectId !== projectId) return;
              markIdle();
            },
            onError: (err) => {
              if (useSaveStatusStore.getState().projectId !== projectId) return;
              if (err instanceof HttpError) {
                if (err.status === 404) return markFatal('not-found');
                if (err.status === 403) return markFatal('forbidden');
                return markError(err);
              }
              return markError(new HttpError(0, null));
            },
          },
        );
      }, DEBOUNCE_MS);
    });
  }, [engineRef, markSaving, markIdle, markError, markFatal, saveMutation, projectId]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);
};

export { useAutosave };
