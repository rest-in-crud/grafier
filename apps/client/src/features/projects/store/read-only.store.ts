import { create } from 'zustand';

type ReadOnlyState =
  | { isReadOnly: false }
  | { isReadOnly: true; source: 'template' | 'non-owner-project' };

type Internal = ReadOnlyState & { __set: boolean };

type ReadOnlyActions = {
  setReadOnlyOnce: (next: ReadOnlyState) => void;
  reset: () => void;
};

const useReadOnlyStore = create<Internal & ReadOnlyActions>((set) => ({
  isReadOnly: false,
  __set: false,
  setReadOnlyOnce: (next) =>
    set((prev) => {
      if (prev.__set) return prev;
      if (next.isReadOnly) {
        return { isReadOnly: true, source: next.source, __set: true };
      }
      return { isReadOnly: false, __set: true };
    }),
  reset: () => set({ isReadOnly: false, __set: false }),
}));

export { useReadOnlyStore };
export type { ReadOnlyState };
