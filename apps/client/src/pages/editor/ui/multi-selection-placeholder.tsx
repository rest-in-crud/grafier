type Props = { count: number };

export function MultiSelectionPlaceholder({ count }: Props) {
  return (
    <div className="grid gap-3.5 p-3">
      <div className="font-mono text-[9px] tracking-[0.2em] text-fg-dim uppercase">Selection</div>
      <div className="font-mono text-[11px] text-foreground">{count} objects selected</div>
    </div>
  );
}
