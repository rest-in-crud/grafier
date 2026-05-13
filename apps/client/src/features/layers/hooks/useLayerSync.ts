import {useLayersStore} from "@/features/layers/store/layers.store.ts";
import {useCanvasStore} from "@/features/canvas/store/canvas.store.ts";
import {useEffect} from "react";
import {recalculateZOrder} from "@/features/layers/lib/layer.utils.ts";

export const useLayerSync = () => {
  const { engineRef } = useCanvasStore()

  useEffect(() => {
    const unsubscribe = useLayersStore.subscribe((state) => {
      const canvas = engineRef.current?.fabricCanvas
      if (!canvas) return
      for (const layer of state.layers) {
        const objects = canvas.getObjects().filter(o => typeof o.data?.id === 'string' && layer.objectsIds.includes(o.data.id))
        for (const object of objects) {
          object.visible = layer.visible
          object.selectable = !layer.locked
          object.evented    = !layer.locked
          const ownOpacity = typeof object.data?.ownOpacity === 'number' ? object.data.ownOpacity : 1
          object.opacity = layer.opacity * ownOpacity
        }
      }
      recalculateZOrder(state.layers, canvas)
    })
    return () => unsubscribe()
  }, [engineRef])

};
