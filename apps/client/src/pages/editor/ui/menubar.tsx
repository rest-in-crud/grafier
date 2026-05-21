import { useState, useEffect } from 'react';

type MenuItemRow = { label: string; kbd?: string };
type MenuSepRow = { sep: true };
type MenuRow = MenuItemRow | MenuSepRow;

const MENUS: Record<string, MenuRow[]> = {
  File: [
    { label: 'New…', kbd: '⌘N' },
    { label: 'Open…', kbd: '⌘O' },
    { sep: true },
    { label: 'Save', kbd: '⌘S' },
    { label: 'Save As…', kbd: '⇧⌘S' },
    { sep: true },
    { label: 'Import…' },
    { label: 'Export…', kbd: '⇧⌘E' },
    { sep: true },
    { label: 'Close', kbd: '⌘W' },
  ],
  Edit: [
    { label: 'Undo', kbd: '⌘Z' },
    { label: 'Redo', kbd: '⇧⌘Z' },
    { sep: true },
    { label: 'Cut', kbd: '⌘X' },
    { label: 'Copy', kbd: '⌘C' },
    { label: 'Paste', kbd: '⌘V' },
    { sep: true },
    { label: 'Select All', kbd: '⌘A' },
    { label: 'Deselect', kbd: '⌘D' },
  ],
  View: [
    { label: 'Zoom In', kbd: '⌘+' },
    { label: 'Zoom Out', kbd: '⌘−' },
    { label: 'Fit on Screen', kbd: '⌘0' },
    { label: '100%', kbd: '⌘1' },
    { sep: true },
    { label: 'Show Rulers', kbd: '⌘R' },
    { label: 'Show Grid', kbd: "⌘'" },
  ],
  Window: [{ label: 'Layers' }, { label: 'Properties' }, { label: 'History' }, { label: 'Color' }],
  Help: [{ label: 'Documentation' }, { label: 'Keyboard Shortcuts' }, { label: 'About Grafier' }],
};

function Menubar() {
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-menubar]')) setOpen(null);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [open]);

  return (
    <div data-menubar className="flex h-full">
      {Object.keys(MENUS).map((name) => (
        <div
          key={name}
          className={[
            'relative flex h-full cursor-pointer select-none items-center px-3 text-xs',
            'text-foreground',
            open === name ? 'bg-white/5' : 'hover:bg-white/5',
          ].join(' ')}
          onClick={(e) => {
            e.stopPropagation();
            setOpen(open === name ? null : name);
          }}
          onMouseEnter={() => {
            if (open && open !== name) setOpen(name);
          }}
        >
          {name}
          {open === name && (
            <div
              className="absolute left-0 top-full z-50 min-w-57.5 border border-hairline-strong bg-raised py-1.5 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {MENUS[name].map((row, i) =>
                'sep' in row ? (
                  <div key={i} className="my-1.25 h-px bg-hairline" />
                ) : (
                  <div
                    key={i}
                    className="flex cursor-pointer items-center justify-between px-3.5 py-1.75 text-xs text-foreground hover:bg-white/6"
                    onClick={() => setOpen(null)}
                  >
                    <span>{row.label}</span>
                    {row.kbd && (
                      <kbd className="font-mono text-[10px] tracking-[0.06em] text-fg-dim">
                        {row.kbd}
                      </kbd>
                    )}
                  </div>
                ),
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export { Menubar };
