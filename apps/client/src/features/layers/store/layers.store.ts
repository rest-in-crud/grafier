import { create } from 'zustand';
import type { Layer, LayerObject } from '@/features/layers/types';
import type { LayersStoreInterface } from '@/features/layers/store/layers.store.interface';

const createLayer = (name: string): Layer => ({
  id: crypto.randomUUID(),
  name,
  visible: true,
  locked: false,
  opacity: 1,
  objects: [],
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

  setCollapsed: (layerId, collapsed) =>
    set((state) => ({
      layers: state.layers.map((l) => (l.id === layerId ? { ...l, collapsed } : l)),
    })),

  addObjectToLayer: (layerId, objectId, name) =>
    set((state) => ({
      layers: state.layers.map((l) =>
        l.id === layerId
          ? { ...l, objects: [...l.objects, { id: objectId, name, visible: true }] }
          : l,
      ),
    })),

  removeObjectFromLayer: (layerId, objectId) =>
    set((state) => ({
      layers: state.layers.map((l) =>
        l.id === layerId ? { ...l, objects: l.objects.filter((o) => o.id !== objectId) } : l,
      ),
    })),

  moveObjectBetweenLayers: (objectId, fromLayerId, toLayerId) =>
    set((state) => {
      let moved: LayerObject | undefined;
      const intermediate = state.layers.map((l) => {
        if (l.id === fromLayerId) {
          moved = l.objects.find((o) => o.id === objectId);
          return { ...l, objects: l.objects.filter((o) => o.id !== objectId) };
        }
        return l;
      });
      if (!moved) return { layers: intermediate };
      const movedObj = moved;
      return {
        layers: intermediate.map((l) =>
          l.id === toLayerId ? { ...l, objects: [...l.objects, movedObj] } : l,
        ),
      };
    }),

  reorderObjectInLayer: (layerId, fromIndex, toIndex) =>
    set((state) => ({
      layers: state.layers.map((l) => {
        if (l.id !== layerId) return l;
        const objects = [...l.objects];
        const [moved] = objects.splice(fromIndex, 1);
        objects.splice(toIndex, 0, moved);
        return { ...l, objects };
      }),
    })),

  setObjectVisibility: (layerId, objectId, visible) =>
    set((state) => ({
      layers: state.layers.map((l) =>
        l.id === layerId
          ? { ...l, objects: l.objects.map((o) => (o.id === objectId ? { ...o, visible } : o)) }
          : l,
      ),
    })),
}));
