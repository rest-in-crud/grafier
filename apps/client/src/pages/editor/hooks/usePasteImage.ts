import { useEffect } from 'react';
import type { RefObject } from 'react';
import type { CanvasEngine } from '@/features/canvas/lib/CanvasEngine';
import { insertImageFromBlob, noticeForInsertImageReason } from '@/features/canvas/lib/insertImage';
import { useNoticeStore } from '@/features/notice/store/notice.store';
import { useReadOnlyStore } from '@/features/projects/store/read-only.store';
import { useCanvasStore } from '@/features/canvas/store/canvas.store';

const usePasteImage = (engineRef: RefObject<CanvasEngine | null>): void => {
  useEffect(() => {
    const handler = async (event: ClipboardEvent) => {
      if (useReadOnlyStore.getState().isReadOnly) return;
      const canvas = engineRef.current?.fabricCanvas;
      if (!canvas) return;
      const items = event.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.kind !== 'file') continue;
        const file = item.getAsFile();
        if (!file) continue;
        if (!file.type.startsWith('image/')) continue;
        const result = await insertImageFromBlob(canvas, file);
        if (result.ok) {
          useCanvasStore.getState().setActiveTool('move');
        } else {
          useNoticeStore.getState().show(noticeForInsertImageReason(result.reason));
        }
        return;
      }
    };
    document.addEventListener('paste', handler);
    return () => document.removeEventListener('paste', handler);
  }, [engineRef]);
};

export { usePasteImage };
