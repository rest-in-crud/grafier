import type { FabricObject } from 'fabric';
import { useLayersStore } from '@/features/layers/store/layers.store';

export function removeFromLayer(obj: FabricObject): void {
  const id = typeof obj.data?.id === 'string' ? obj.data.id : undefined;
  if (!id) return;
  const { layers, removeObjectFromLayer } = useLayersStore.getState();
  const owningLayer = layers.find((l) => l.objects.some((o) => o.id === id));
  if (owningLayer) removeObjectFromLayer(owningLayer.id, id);
}
