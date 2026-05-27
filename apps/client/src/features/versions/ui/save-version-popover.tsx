import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { Button } from '@/shared/ui/button';
import { useVersionUiStore } from '@/features/versions/store/version-ui.store';
import { useSaveVersion } from '@/features/versions/queries';
import { formatVersionName } from '@/features/versions/lib/version-labels';
import { useNoticeStore } from '@/features/notice/store/notice.store';
import { useLayersStore } from '@/features/layers/store/layers.store';
import { useReadOnlyStore } from '@/features/projects/store/read-only.store';
import { useCanvasStore } from '@/features/canvas/store/canvas.store';
import { saveCanvasRequestSchema } from '@/features/projects/schema';
import type { CanvasEngine } from '@/features/canvas/lib/CanvasEngine';

type SaveVersionPopoverProps = {
  designId: string;
  engineRef: RefObject<CanvasEngine | null>;
};

const SaveVersionPopover = ({ designId, engineRef }: SaveVersionPopoverProps) => {
  const saveOpen = useVersionUiStore((s) => s.saveOpen);
  const openSave = useVersionUiStore((s) => s.openSave);
  const closeSave = useVersionUiStore((s) => s.closeSave);
  const isReadOnly = useReadOnlyStore((s) => s.isReadOnly);
  const saveVersion = useSaveVersion(designId);
  const [label, setLabel] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!saveOpen) return;
    const timer = setTimeout(() => {
      setLabel(formatVersionName(new Date()));
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);
    return () => clearTimeout(timer);
  }, [saveOpen]);

  if (isReadOnly) return null;

  const onSave = async () => {
    const engine = engineRef.current;
    if (!engine) return;
    try {
      const canvasJSON = saveCanvasRequestSchema.shape.canvasJSON.parse(
        engine.fabricCanvas.toJSON(),
      );
      const layersJSON = useLayersStore.getState().layers;
      const { artboardWidth, artboardHeight } = useCanvasStore.getState();
      const trimmed = label.trim();
      await saveVersion.mutateAsync({
        label: trimmed.length > 0 ? trimmed : null,
        canvasJSON,
        layersJSON,
        width: artboardWidth,
        height: artboardHeight,
      });
      closeSave();
      useNoticeStore.getState().show('✓ Version saved');
    } catch {
      useNoticeStore.getState().show('✕ Could not save version');
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      void onSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closeSave();
    }
  };

  return (
    <Popover open={saveOpen} onOpenChange={(next) => (next ? openSave() : closeSave())}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm">
          Save version
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80">
        <div className="flex flex-col gap-3">
          <label className="font-mono text-[11px] uppercase tracking-[0.16em] text-fg-dim">
            Version name
          </label>
          <input
            ref={inputRef}
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={saveVersion.isPending}
            className="border border-hairline-strong bg-background px-2 py-1.5 font-mono text-[12px] text-foreground outline-none focus:border-foreground"
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={closeSave}>
              Cancel
            </Button>
            <Button size="sm" onClick={onSave} disabled={saveVersion.isPending}>
              {saveVersion.isPending ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export { SaveVersionPopover };
