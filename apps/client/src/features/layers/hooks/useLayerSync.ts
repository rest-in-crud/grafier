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
        const objectVisibility = new Map(layer.objects.map((o) => [o.id, o.visible]));
        const canvasObjects = canvas.getObjects().filter((o) => {
          const id = o.data?.id;
          return typeof id === 'string' && objectVisibility.has(id);
        });
        for (const object of canvasObjects) {
          const ownVisible = objectVisibility.get(object.data?.id ?? '') ?? true;
          object.visible = layer.visible && ownVisible;
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
