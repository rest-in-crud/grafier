import { create } from 'zustand';
import { HttpError } from '@/shared/lib/api-client';

type SaveStatus =
  | { tag: 'idle' }
  | { tag: 'dirty' }
  | { tag: 'saving'; startedAt: number }
  | { tag: 'error'; attempt: number; lastError: HttpError }
  | { tag: 'fatal'; reason: 'not-found' | 'forbidden' };

type SaveStatusState = {
  projectId: string | null;
  status: SaveStatus;
};

type SaveStatusActions = {
  bindProject: (projectId: string) => void;
  unbindProject: () => void;
  markDirty: () => void;
  markSaving: () => void;
  markIdle: () => void;
  markError: (error: HttpError) => void;
  markFatal: (reason: 'not-found' | 'forbidden') => void;
};

const useSaveStatusStore = create<SaveStatusState & SaveStatusActions>((set, get) => ({
  projectId: null,
  status: { tag: 'idle' },

  bindProject: (projectId) => set({ projectId, status: { tag: 'idle' } }),
  unbindProject: () => set({ projectId: null, status: { tag: 'idle' } }),
  markDirty: () => {
    const s = get().status;
    if (s.tag === 'fatal') return;
    set({ status: { tag: 'dirty' } });
  },
  markSaving: () => set({ status: { tag: 'saving', startedAt: Date.now() } }),
  markIdle: () => set({ status: { tag: 'idle' } }),
  markError: (error) => {
    const prev = get().status;
    const attempt = prev.tag === 'error' ? prev.attempt + 1 : 1;
    set({ status: { tag: 'error', attempt, lastError: error } });
  },
  markFatal: (reason) => set({ status: { tag: 'fatal', reason } }),
}));

export { useSaveStatusStore };
export type { SaveStatus };
