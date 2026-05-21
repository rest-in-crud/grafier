import { useEffect } from 'react';
import type { RefObject } from 'react';
import { useLayersStore } from '@/features/layers/store/layers.store';
import { recalculateZOrder } from '@/features/layers/lib/layer.utils';
import type { CanvasEngine } from '@/features/canvas/lib/CanvasEngine';

export function useLayerSync(engineRef: RefObject<CanvasEngine | null>) {
  useEffect(() => {
    const unsubscribe = useLayersStore.subscribe((state) => {
      const canvas = engineRef.current?.fabricCanvas;
      if (!canvas) return;

      for (const layer of state.layers) {
        const byId = new Map(layer.objects.map((o) => [o.id, o]));
        const canvasObjects = canvas.getObjects().filter((o) => {
          const id = o.data?.id;
          return typeof id === 'string' && byId.has(id);
        });
        for (const object of canvasObjects) {
          const layerObj = byId.get(object.data?.id ?? '');
          const ownVisible = layerObj?.visible ?? true;
          const ownLocked = layerObj?.locked ?? false;
          object.visible = layer.visible && ownVisible;
          object.selectable = !layer.locked && !ownLocked;
          object.evented = !layer.locked && !ownLocked;
          const ownOpacity =
            typeof object.data?.ownOpacity === 'number' ? object.data.ownOpacity : 1;
          object.opacity = layer.opacity * ownOpacity;
        }
      }
      recalculateZOrder(state.layers, canvas);
    });
    return () => unsubscribe();
  }, [engineRef]);
}
