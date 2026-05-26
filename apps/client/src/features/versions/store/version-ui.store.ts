import { create } from 'zustand';

type VersionUiState = {
  saveOpen: boolean;
  historyOpen: boolean;
  lastAutoVersionAt: number;
};

type VersionUiActions = {
  openSave: () => void;
  closeSave: () => void;
  openHistory: () => void;
  closeHistory: () => void;
  markAutoVersionSaved: () => void;
};

const useVersionUiStore = create<VersionUiState & VersionUiActions>((set) => ({
  saveOpen: false,
  historyOpen: false,
  lastAutoVersionAt: 0,
  openSave: () => set({ saveOpen: true }),
  closeSave: () => set({ saveOpen: false }),
  openHistory: () => set({ historyOpen: true }),
  closeHistory: () => set({ historyOpen: false }),
  markAutoVersionSaved: () => set({ lastAutoVersionAt: Date.now() }),
}));

export { useVersionUiStore };
