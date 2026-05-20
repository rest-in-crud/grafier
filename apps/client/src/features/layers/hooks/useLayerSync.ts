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
        const ids = new Set(layer.objectsIds);
        const objects = canvas.getObjects().filter((o) => {
          const id = o.data?.id;
          return typeof id === 'string' && ids.has(id);
        });
        for (const object of objects) {
          object.visible = layer.visible;
          object.selectable = !layer.locked;
          object.evented = !layer.locked;
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
