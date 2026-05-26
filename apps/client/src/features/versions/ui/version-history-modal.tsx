import { useState } from 'react';
import type { RefObject } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Checkbox } from '@/shared/ui/checkbox';
import { useVersionUiStore } from '@/features/versions/store/version-ui.store';
import {
  useVersionsList,
  useRenameVersion,
  useDeleteVersion,
  useRestoreVersion,
} from '@/features/versions/queries';
import { isAutoLabel } from '@/features/versions/lib/version-labels';
import { VersionRow } from './version-row';
import { useNoticeStore } from '@/features/notice/store/notice.store';
import { useReadOnlyStore } from '@/features/projects/store/read-only.store';
import type { CanvasEngine } from '@/features/canvas/lib/CanvasEngine';

type VersionHistoryModalProps = {
  designId: string;
  engineRef: RefObject<CanvasEngine | null>;
};

const VersionHistoryModal = ({ designId, engineRef }: VersionHistoryModalProps) => {
  const historyOpen = useVersionUiStore((s) => s.historyOpen);
  const closeHistory = useVersionUiStore((s) => s.closeHistory);
  const [showAuto, setShowAuto] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const { data: versions, isPending, isError, refetch } = useVersionsList(designId, historyOpen);
  const rename = useRenameVersion(designId);
  const del = useDeleteVersion(designId);
  const restore = useRestoreVersion(designId, engineRef);
  const isReadOnly = useReadOnlyStore((s) => s.isReadOnly);
  const canEdit = !isReadOnly;

  const sorted = [...(versions ?? [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const filtered = sorted.filter((v) => showAuto || !isAutoLabel(v.label));

  const onRestore = async (versionId: string) => {
    setRestoringId(versionId);
    try {
      await restore.mutateAsync(versionId);
      closeHistory();
      const restored = versions?.find((v) => v.id === versionId);
      const labelForNotice = restored?.label ?? 'previous version';
      useNoticeStore.getState().show(`✓ Restored to ${labelForNotice}`);
    } catch {
      /* notice already shown by the mutation onError */
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <Dialog open={historyOpen} onOpenChange={(next) => (next ? null : closeHistory())}>
      <DialogContent className="max-w-2xl">
        <DialogTitle className="font-sans text-lg font-medium text-foreground">
          Version history
        </DialogTitle>

        {canEdit ? (
          <label className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-fg-dim">
            <Checkbox checked={showAuto} onCheckedChange={(v) => setShowAuto(v === true)} />
            Show auto-saved
          </label>
        ) : null}

        {isPending ? (
          <div className="flex flex-col gap-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-14 border border-hairline bg-black/10" />
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-fg-dim">
              ✕ Failed to load history
            </p>
            <Button size="sm" onClick={() => void refetch()}>
              Retry
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-center font-mono text-[11px] uppercase tracking-[0.18em] text-fg-dim">
            No saved versions yet. Press Cmd+Shift+S or click Save version to create your first one.
          </div>
        ) : (
          <div className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto">
            {filtered.map((v) => (
              <VersionRow
                key={v.id}
                version={v}
                canEdit={canEdit}
                disabled={restoringId !== null}
                isRestoring={restoringId === v.id}
                onRestore={() => void onRestore(v.id)}
                onRename={(label) => rename.mutate({ versionId: v.id, label })}
                onDelete={() => del.mutate(v.id)}
              />
            ))}
          </div>
        )}

        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={closeHistory}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { VersionHistoryModal };
