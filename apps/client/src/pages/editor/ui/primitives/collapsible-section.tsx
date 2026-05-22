import { useState } from 'react';
import type { ReactNode } from 'react';
import { CaretDown, CaretRight } from '@phosphor-icons/react';
import { loadCollapsed, saveCollapsed } from '@/pages/editor/lib/preferences';

type Props = {
  id: string;
  title: string;
  children: ReactNode;
};

export function CollapsibleSection({ id, title, children }: Props) {
  const [collapsed, setCollapsed] = useState(() => loadCollapsed(id));

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    saveCollapsed(id, next);
  };

  return (
    <div className="grid gap-2">
      <button
        type="button"
        onClick={toggle}
        className="flex items-center gap-1 text-left"
        title={collapsed ? 'Expand' : 'Collapse'}
      >
        <span className="flex h-3 w-3 shrink-0 items-center justify-center text-fg-dim">
          {collapsed ? <CaretRight size={9} weight="bold" /> : <CaretDown size={9} weight="bold" />}
        </span>
        <span className="font-mono text-[9px] tracking-[0.2em] text-fg-dim uppercase">{title}</span>
      </button>
      {!collapsed && children}
    </div>
  );
}
