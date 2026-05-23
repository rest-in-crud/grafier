import { useState } from 'react';
import type { MouseEvent } from 'react';
import { Link } from 'react-router';
import { Menubar } from './menubar';
import { IconButton } from './primitives';
import { IUndo, IRedo, ISettings, IExport } from '../icons';
import { useHistoryStore } from '@/features/canvas/store/history.store';
import { formatHotkey } from '@/shared/lib/platform';

type TooltipState = { name: string; kbd: string; x: number; y: number } | null;

export type TopbarProps = {
  avatarInitial: string;
  onLogout: () => void;
};

function Topbar({ avatarInitial, onLogout }: TopbarProps) {
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

      <Menubar />

      <div className="flex flex-1 items-center justify-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-fg-dim">
        <span className="text-foreground">Untitled-01.graf</span>
        <span>·</span>
        <span className="text-fg-dimmer">1920 × 1080 PX · RGB / 8</span>
      </div>

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

        <IconButton>
          <ISettings size={14} />
        </IconButton>

        <span role="button" className="editor-gradient-btn">
          <span className="editor-gradient-btn-label">
            <IExport size={11} />
            Export
          </span>
        </span>

        <button
          type="button"
          onClick={onLogout}
          aria-label="Log out"
          className="editor-avatar-bg flex h-6.5 w-6.5 cursor-pointer items-center justify-center border border-hairline-strong font-mono text-[10px] text-foreground"
        >
          {avatarInitial}
        </button>
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
