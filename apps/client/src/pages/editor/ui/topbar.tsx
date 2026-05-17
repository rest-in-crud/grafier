import { Menubar } from './menubar';
import { IUndo, IRedo, ISettings, IExport } from '../icons';

export type TopbarProps = {
  avatarInitial: string;
  onLogout: () => void;
};

function Topbar({ avatarInitial, onLogout }: TopbarProps) {
  return (
    <div className="flex h-full items-center gap-3.5 border-b border-hairline bg-chrome px-3">
      <span className="flex h-full items-center border-r border-hairline pr-3.5 font-mono text-[11px] font-semibold tracking-[0.28em]">
        GRAFIER
      </span>

      <Menubar />

      <div className="flex flex-1 items-center justify-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-fg-dim">
        <span className="text-foreground">Untitled-01.graf</span>
        <span>·</span>
        <span className="text-fg-dimmer">1920 × 1080 PX · RGB / 8</span>
      </div>

      <div className="flex h-full items-center gap-2">
        <button
          type="button"
          title="Undo"
          className="flex h-7 w-7 cursor-pointer items-center justify-center border border-transparent text-fg-dim transition-all duration-120 hover:border-hairline-strong hover:text-foreground"
        >
          <IUndo size={14} />
        </button>
        <button
          type="button"
          title="Redo"
          className="flex h-7 w-7 cursor-pointer items-center justify-center border border-transparent text-fg-dim transition-all duration-120 hover:border-hairline-strong hover:text-foreground"
        >
          <IRedo size={14} />
        </button>

        <div className="w-px bg-hairline" style={{ height: 18, margin: '0 4px' }} />

        <button
          type="button"
          title="Settings"
          className="flex h-7 w-7 cursor-pointer items-center justify-center border border-transparent text-fg-dim transition-all duration-120 hover:border-hairline-strong hover:text-foreground"
        >
          <ISettings size={14} />
        </button>

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
    </div>
  );
}

export { Topbar };
