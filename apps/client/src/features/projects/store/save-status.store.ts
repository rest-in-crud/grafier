import { create } from 'zustand';
import { HttpError } from '@/shared/lib/api-client';

type SaveStatus =
  | { tag: 'idle' }
  | { tag: 'dirty' }
  | { tag: 'saving'; startedAt: number }
  | { tag: 'error'; attempt: number; lastError: HttpError }
  | { tag: 'fatal'; reason: 'not-found' | 'forbidden' };

type FlushFn = () => Promise<void>;

type SaveStatusState = {
  projectId: string | null;
  status: SaveStatus;
  pendingFlush: FlushFn | null;
};

type SaveStatusActions = {
  bindProject: (projectId: string) => void;
  unbindProject: () => void;
  markDirty: () => void;
  markSaving: () => void;
  markIdle: () => void;
  markError: (error: HttpError) => void;
  markFatal: (reason: 'not-found' | 'forbidden') => void;
  setPendingFlush: (fn: FlushFn | null) => void;
};

const useSaveStatusStore = create<SaveStatusState & SaveStatusActions>((set, get) => ({
  projectId: null,
  status: { tag: 'idle' },
  pendingFlush: null,

  bindProject: (projectId) => set({ projectId, status: { tag: 'idle' }, pendingFlush: null }),
  unbindProject: () => set({ projectId: null, status: { tag: 'idle' }, pendingFlush: null }),
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
  setPendingFlush: (fn) => set({ pendingFlush: fn }),
}));

export { useSaveStatusStore };
export type { SaveStatus };
