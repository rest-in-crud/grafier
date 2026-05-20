import { create } from 'zustand';
import type { Layer } from '@/features/layers/types';
import type { LayersStoreInterface } from '@/features/layers/store/layers.store.interface';

const createLayer = (name: string): Layer => ({
  id: crypto.randomUUID(),
  name,
  visible: true,
  locked: false,
  opacity: 1,
  objectsIds: [],
  collapsed: false,
});

const firstLayer = createLayer('Layer 1');

export const useLayersStore = create<LayersStoreInterface>((set) => ({
  layers: [firstLayer],
  activeLayerId: firstLayer.id,

  setActiveLayer: (id) => set({ activeLayerId: id }),

  addLayer: (name) =>
    set((state) => {
      const newLayer = createLayer(name ?? `Layer ${state.layers.length + 1}`);
      return { layers: [...state.layers, newLayer], activeLayerId: newLayer.id };
    }),

  removeLayer: (id) =>
    set((state) => ({
      layers: state.layers.filter((l) => l.id !== id),
      activeLayerId:
        state.activeLayerId === id
          ? (state.layers.find((l) => l.id !== id)?.id ?? null)
          : state.activeLayerId,
    })),

  reorderLayers: (fromIndex, toIndex) =>
    set((state) => {
      const layers = [...state.layers];
      const [moved] = layers.splice(fromIndex, 1);
      layers.splice(toIndex, 0, moved);
      return { layers };
    }),

  setVisibility: (layerId, visible) =>
    set((state) => ({
      layers: state.layers.map((l) => (l.id === layerId ? { ...l, visible } : l)),
    })),

  setLocked: (layerId, locked) =>
    set((state) => ({
      layers: state.layers.map((l) => (l.id === layerId ? { ...l, locked } : l)),
    })),

  setOpacity: (layerId, opacity) =>
    set((state) => ({
      layers: state.layers.map((l) => (l.id === layerId ? { ...l, opacity } : l)),
    })),

  renameLayer: (layerId, name) =>
    set((state) => ({
      layers: state.layers.map((l) => (l.id === layerId ? { ...l, name } : l)),
    })),

  addObjectToLayer: (layerId, objectId) =>
    set((state) => ({
      layers: state.layers.map((l) =>
        l.id === layerId ? { ...l, objectsIds: [...l.objectsIds, objectId] } : l,
      ),
    })),

  removeObjectFromLayer: (layerId, objectId) =>
    set((state) => ({
      layers: state.layers.map((l) =>
        l.id === layerId ? { ...l, objectsIds: l.objectsIds.filter((id) => id !== objectId) } : l,
      ),
    })),

  moveObjectBetweenLayers: (objectId, fromLayerId, toLayerId) =>
    set((state) => ({
      layers: state.layers.map((l) => {
        if (l.id === fromLayerId) {
          return { ...l, objectsIds: l.objectsIds.filter((id) => id !== objectId) };
        }
        if (l.id === toLayerId) {
          return { ...l, objectsIds: [...l.objectsIds, objectId] };
        }
        return l;
      }),
    })),

  reorderObjectInLayer: (layerId, fromIndex, toIndex) =>
    set((state) => ({
      layers: state.layers.map((l) => {
        if (l.id !== layerId) return l;
        const objectsIds = [...l.objectsIds];
        const [moved] = objectsIds.splice(fromIndex, 1);
        objectsIds.splice(toIndex, 0, moved);
        return { ...l, objectsIds };
      }),
    })),
}));
