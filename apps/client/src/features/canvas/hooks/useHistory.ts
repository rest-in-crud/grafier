import { useCallback, useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { ActiveSelection } from 'fabric';
import type { CanvasEngine } from '@/features/canvas/lib/CanvasEngine';
import { removeFromLayer } from '@/features/canvas/lib/removeFromLayer';
import { useLayersStore } from '@/features/layers/store/layers.store';
import { useHistoryStore, HistorySnapshot } from '@/features/canvas/store/history.store';

export const useHistory = (engineRef: RefObject<CanvasEngine | null>) => {
  const lastKnownSnapshot = useRef<HistorySnapshot | null>(null);

  const flushPending = useRef<(() => void) | null>(null);

  const takeSnapshot = useCallback((): HistorySnapshot => {
    const canvas = engineRef.current?.fabricCanvas;
    const { layers, activeLayerId } = useLayersStore.getState();
    return {
      canvasJSON: canvas ? canvas.toJSON() : {},
      layersState: {
        layers: structuredClone(layers),
        activeLayerId,
      },
    };
  }, [engineRef]);

  const restoreSnapshot = useCallback(
    async (snapshot: HistorySnapshot) => {
      const engine = engineRef.current;
      if (!engine) return;
      const canvas = engine.fabricCanvas;

      engine.isRestoring = true;
      await canvas.loadFromJSON(snapshot.canvasJSON);
      engine.isRestoring = false;

      canvas.requestRenderAll();

      useLayersStore.setState({
        layers: snapshot.layersState.layers,
        activeLayerId: snapshot.layersState.activeLayerId,
      });
    },
    [engineRef],
  );

  const undo = useCallback(async () => {
    flushPending.current?.();

    const { consumeUndo, pushToFuture } = useHistoryStore.getState();
    const target = consumeUndo();
    if (!target) return;

    if (lastKnownSnapshot.current) {
      pushToFuture(lastKnownSnapshot.current);
    }

    await restoreSnapshot(target);
    lastKnownSnapshot.current = target;
  }, [restoreSnapshot]);

  const redo = useCallback(async () => {
    flushPending.current?.();

    const { consumeRedo, pushToPast } = useHistoryStore.getState();
    const target = consumeRedo();
    if (!target) return;

    if (lastKnownSnapshot.current) {
      pushToPast(lastKnownSnapshot.current);
    }

    await restoreSnapshot(target);
    lastKnownSnapshot.current = target;
  }, [restoreSnapshot]);

  useEffect(() => {
    useHistoryStore.getState().setUndo(() => {
      void undo();
    });
    useHistoryStore.getState().setRedo(() => {
      void redo();
    });
    return () => {
      useHistoryStore.getState().setUndo(() => {});
      useHistoryStore.getState().setRedo(() => {});
    };
  }, [undo, redo]);

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    const canvas = engine.fabricCanvas;

    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    const commit = () => {
      debounceTimer = null;
      flushPending.current = null;
      if (lastKnownSnapshot.current) {
        useHistoryStore.getState().pushSnapshot(lastKnownSnapshot.current);
      }
      lastKnownSnapshot.current = takeSnapshot();
    };

    const schedulePush = () => {
      if (engine.isRestoring) return;
      if (debounceTimer) clearTimeout(debounceTimer);
      flushPending.current = () => {
        if (debounceTimer) {
          clearTimeout(debounceTimer);
          commit();
        }
      };
      debounceTimer = setTimeout(commit, 50);
    };

    const onPathCreated = () => schedulePush();
    const onObjectAdded = () => {
      if (canvas.isDrawingMode) return;
      schedulePush();
    };

    const onObjectModified = () => schedulePush();
    const onObjectRemoved = () => schedulePush();

    canvas.on('path:created', onPathCreated);
    canvas.on('object:added', onObjectAdded);
    canvas.on('object:modified', onObjectModified);
    canvas.on('object:removed', onObjectRemoved);

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      canvas.off('path:created', onPathCreated);
      canvas.off('object:added', onObjectAdded);
      canvas.off('object:modified', onObjectModified);
      canvas.off('object:removed', onObjectRemoved);
    };
  }, [engineRef, takeSnapshot]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Delete' || e.code === 'Backspace') {
        if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return;
        const tag = (document.activeElement?.tagName ?? '').toLowerCase();
        if (tag === 'input' || tag === 'textarea') return;
        const canvas = engineRef.current?.fabricCanvas;
        if (!canvas) return;
        const active = canvas.getActiveObject();
        if (!active || ('isEditing' in active && active.isEditing)) return;
        const targets =
          active instanceof ActiveSelection ? [...active.getObjects()] : [active];
        canvas.discardActiveObject();
        for (const obj of targets) {
          canvas.remove(obj);
          removeFromLayer(obj);
        }
        canvas.requestRenderAll();
        return;
      }

      const ctrl = e.ctrlKey || e.metaKey;
      if (!ctrl) return;

      if (e.code === 'KeyZ') {
        e.preventDefault();
        if (e.shiftKey) {
          void redo();
        } else {
          void undo();
        }
      } else if (e.code === 'KeyY') {
        e.preventDefault();
        void redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, engineRef]);

  useEffect(() => {
    if (!engineRef.current) return;
    lastKnownSnapshot.current = takeSnapshot();
  }, [engineRef, takeSnapshot]);
};
