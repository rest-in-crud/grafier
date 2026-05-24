import { useSaveStatusStore } from '@/features/projects/store/save-status.store';

const useFlushAutosave = () => {
  return async () => {
    const fn = useSaveStatusStore.getState().pendingFlush;
    if (fn) await fn();
  };
};

export { useFlushAutosave };
