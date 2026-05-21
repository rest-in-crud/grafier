import type { Canvas } from 'fabric';
import type { Layer } from '@/features/layers/types';

export function recalculateZOrder(layers: Layer[], canvas: Canvas) {
  let globalIndex = 0;
  for (const layer of layers) {
    for (const { id: objectId } of layer.objects) {
      const obj = canvas.getObjects().find((o) => o.data?.id === objectId);
      if (obj) {
        canvas.moveObjectTo(obj, globalIndex++);
      }
    }
  }
  canvas.requestRenderAll();
}
