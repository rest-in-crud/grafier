import { useState } from 'react';
import type { MouseEvent, RefObject } from 'react';
import { Link } from 'react-router';
import { PublishToggleButton, SaveAsTemplateButton } from './publish-popover';
import { ShareLinkPopover } from './share-link-popover';
import { ReadOnlyAuthorLabel, ReadOnlyActions } from './read-only-banner';
import { IconButton } from './primitives';
import { PublicIcon, PrivateIcon } from '@/shared/ui/visibility-icons';
import type { Canvas } from 'fabric';
import { IUndo, IRedo, IHistory } from '../icons';
import { ExportMenu } from './export-menu';
import { useHistoryStore } from '@/features/canvas/store/history.store';
import { formatHotkey } from '@/shared/lib/platform';
import { useVersionUiStore } from '@/features/versions/store/version-ui.store';
import { SaveVersionPopover } from '@/features/versions/ui/save-version-popover';
import type { CanvasEngine } from '@/features/canvas/lib/CanvasEngine';

type TooltipState = { name: string; kbd: string; x: number; y: number } | null;

export type TopbarProps = {
  projectName?: string;
  width?: number;
  height?: number;
  designId?: string;
  isPublic?: boolean;
  isOwner?: boolean;
  getCanvas?: () => Canvas | null;
  exportProjectName?: string;
  engineRef?: RefObject<CanvasEngine | null>;
};

function Topbar({
  projectName,
  width,
  height,
  designId,
  isPublic,
  isOwner,
  getCanvas,
  exportProjectName,
  engineRef,
}: TopbarProps) {
  const [tooltip, setTooltip] = useState<TooltipState>(null);
  const undo = useHistoryStore((s) => s.undo);
  const redo = useHistoryStore((s) => s.redo);

  function showTooltip(e: MouseEvent<HTMLButtonElement>, name: string, kbd: string) {
    const r = e.currentTarget.getBoundingClientRect();
    setTooltip({ name, kbd, x: r.left + r.width / 2, y: r.bottom + 6 });
  }

  return (
    <div className="flex h-full items-center gap-3.5 border-b border-hairline bg-chrome px-3">
      <Link
        to="/"
        className="flex h-full items-center border-r border-hairline pr-3.5 font-mono text-[11px] font-semibold tracking-[0.28em] text-foreground hover:text-foreground"
      >
        GRAFIER
      </Link>

      <div className="flex h-full items-center gap-2">
        <IconButton
          onClick={undo}
          onMouseEnter={(e) => showTooltip(e, 'Undo', formatHotkey(['Mod', 'Z']))}
          onMouseLeave={() => setTooltip(null)}
        >
          <IUndo size={14} />
        </IconButton>
        <IconButton
          onClick={redo}
          onMouseEnter={(e) => showTooltip(e, 'Redo', formatHotkey(['Mod', 'Y']))}
          onMouseLeave={() => setTooltip(null)}
        >
          <IRedo size={14} />
        </IconButton>

        <div className="mx-1 h-[18px] w-px bg-hairline" />

        <IconButton
          onClick={() => useVersionUiStore.getState().openHistory()}
          onMouseEnter={(e) => showTooltip(e, 'Version history', '')}
          onMouseLeave={() => setTooltip(null)}
          aria-label="Version history"
        >
          <IHistory size={14} />
        </IconButton>

        {designId && engineRef ? (
          <SaveVersionPopover designId={designId} engineRef={engineRef} />
        ) : null}
      </div>

      <div className="flex flex-1 items-center justify-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-fg-dim">
        {projectName && width !== undefined && height !== undefined ? (
          <>
            <span className="max-w-[40ch] truncate text-foreground" title={projectName}>
              {projectName}
            </span>
            {designId && isOwner ? (
              <>
                <PublishToggleButton designId={designId} />
                <ShareLinkPopover designId={designId} />
                <SaveAsTemplateButton designId={designId} />
              </>
            ) : isPublic !== undefined ? (
              isPublic ? (
                <PublicIcon className="size-3.5 text-fg-dim" />
              ) : (
                <PrivateIcon className="size-3.5 text-fg-dim" />
              )
            ) : null}
            {designId ? <ReadOnlyAuthorLabel designId={designId} /> : null}
            <span>·</span>
            <span className="text-fg-dimmer">{`${width} × ${height} PX`}</span>
          </>
        ) : null}
      </div>

      <div className="flex h-full items-center gap-2">
        <ExportMenu
          getCanvas={getCanvas ?? (() => null)}
          projectName={exportProjectName ?? 'design'}
          projectWidth={width ?? 1920}
          projectHeight={height ?? 1080}
        />

        {designId ? <ReadOnlyActions designId={designId} /> : null}
      </div>

      {tooltip && (
        <span
          className="font-mono pointer-events-none fixed z-30 whitespace-nowrap border border-hairline-strong bg-raised px-2 py-1 text-[10px] tracking-[0.12em] text-foreground"
          style={{ left: tooltip.x, top: tooltip.y, transform: 'translateX(-50%)' }}
        >
          {tooltip.name}
          <span className="ml-2 text-muted-foreground">{tooltip.kbd}</span>
        </span>
      )}
    </div>
  );
}

export { Topbar };
