import { create } from 'zustand';
import { Layer } from '@/features/layers/types';

export interface LayersSnapshot {
  layers: Layer[];
  activeLayerId: string | null;
}

export interface HistorySnapshot {
  canvasJSON: object;
  layersState: LayersSnapshot;
}

interface HistoryStore {
  past: HistorySnapshot[];
  future: HistorySnapshot[];
  pushSnapshot: (snapshot: HistorySnapshot) => void;
  consumeUndo: () => HistorySnapshot | undefined;
  consumeRedo: () => HistorySnapshot | undefined;
  pushToFuture: (snapshot: HistorySnapshot) => void;
  pushToPast: (snapshot: HistorySnapshot) => void;
  undo: () => void;
  setUndo: (fn: () => void) => void;
  redo: () => void;
  setRedo: (fn: () => void) => void;
}

const MAX_HISTORY = 50;

export const useHistoryStore = create<HistoryStore>((set, get) => ({
  past: [],
  future: [],

  pushSnapshot: (snapshot) =>
    set((state) => ({
      past: [...state.past, snapshot].slice(-MAX_HISTORY),
      future: [],
    })),

  consumeUndo: () => {
    const { past } = get();
    if (past.length === 0) return undefined;
    const snapshot = past[past.length - 1];
    set((state) => ({ past: state.past.slice(0, -1) }));
    return snapshot;
  },

  consumeRedo: () => {
    const { future } = get();
    if (future.length === 0) return undefined;
    const snapshot = future[0];
    set((state) => ({ future: state.future.slice(1) }));
    return snapshot;
  },

  pushToFuture: (snapshot) =>
    set((state) => ({
      future: [snapshot, ...state.future].slice(0, MAX_HISTORY),
    })),

  pushToPast: (snapshot) =>
    set((state) => ({
      past: [...state.past, snapshot].slice(-MAX_HISTORY),
    })),

  undo: () => {},
  setUndo: (fn) => set({ undo: fn }),
  redo: () => {},
  setRedo: (fn) => set({ redo: fn }),
}));
