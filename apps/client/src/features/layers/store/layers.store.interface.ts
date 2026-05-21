import type { Layer } from '@/features/layers/types';

export interface LayersStoreInterface {
  layers: Layer[];
  activeLayerId: string | null;

  setActiveLayer: (id: string) => void;
  addLayer: (name?: string) => void;
  removeLayer: (id: string) => void;
  reorderLayers: (fromIndex: number, toIndex: number) => void;

  setVisibility: (layerId: string, visible: boolean) => void;
  setLocked: (layerId: string, locked: boolean) => void;
  setOpacity: (layerId: string, opacity: number) => void;
  renameLayer: (layerId: string, name: string) => void;
  setCollapsed: (layerId: string, collapsed: boolean) => void;

  addObjectToLayer: (layerId: string, objectId: string, name: string) => void;
  removeObjectFromLayer: (layerId: string, objectId: string) => void;
  moveObjectBetweenLayers: (objectId: string, fromLayerId: string, toLayerId: string) => void;
  reorderObjectInLayer: (layerId: string, fromIndex: number, toIndex: number) => void;
  setObjectVisibility: (layerId: string, objectId: string, visible: boolean) => void;
  setObjectLocked: (layerId: string, objectId: string, locked: boolean) => void;
  renameObject: (layerId: string, objectId: string, name: string) => void;
}
