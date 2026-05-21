import { useState } from 'react';
import { useCanvasStore } from '@/features/canvas/store/canvas.store';
import type { SelectionPatch, SelectionSnapshot } from '@/features/canvas/store/canvas.store';
import { Slider, Swatch, Panel, PanelHeader, PanelBody } from './primitives';

const TYPE_LABELS: Record<string, string> = {
  rect: 'RECT',
  circle: 'CIRCLE',
  ellipse: 'ELLIPSE',
  triangle: 'TRIANGLE',
  line: 'LINE',
  path: 'PATH',
  'i-text': 'TEXT',
};

type NumberFieldProps = {
  symbol: string;
  value: number;
  suffix?: string;
  onCommit: (v: number) => void;
};

function NumberField({ symbol, value, suffix, onCommit }: NumberFieldProps) {
  const display = suffix ? `${value}${suffix}` : String(value);
  const [local, setLocal] = useState(display);
  const [prevDisplay, setPrevDisplay] = useState(display);

  if (display !== prevDisplay) {
    setPrevDisplay(display);
    setLocal(display);
  }

  const commit = () => {
    const n = Number.parseFloat(local);
    if (Number.isFinite(n) && n !== value) onCommit(n);
    else setLocal(display);
  };

  return (
    <div className="relative">
      <span className="font-mono absolute top-1/2 left-2 -translate-y-1/2 text-[9px] text-fg-dim">
        {symbol}
      </span>
      <input
        className="w-full border border-hairline bg-field py-1.25 pr-2 pl-5.5 text-[11px] text-foreground focus:border-foreground focus:outline-none"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur();
          if (e.key === 'Escape') {
            setLocal(display);
            e.currentTarget.blur();
          }
        }}
      />
    </div>
  );
}

type ColorFieldProps = {
  value: string | null;
  onCommit: (color: string) => void;
};

function ColorField({ value, onCommit }: ColorFieldProps) {
  const display = value ?? 'NONE';
  const [local, setLocal] = useState(display);
  const [prevDisplay, setPrevDisplay] = useState(display);

  if (display !== prevDisplay) {
    setPrevDisplay(display);
    setLocal(display);
  }

  const commit = () => {
    const trimmed = local.trim();
    if (trimmed !== (value ?? '') && trimmed.length > 0 && trimmed !== 'NONE') {
      onCommit(trimmed);
    } else {
      setLocal(display);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Swatch
        interactive={false}
        color={value ?? undefined}
        style={value === null ? { background: 'transparent', borderStyle: 'dashed' } : undefined}
      />
      <input
        className="flex-1 border border-hairline bg-field px-2 py-1.25 text-[11px] text-foreground focus:border-foreground focus:outline-none"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur();
          if (e.key === 'Escape') {
            setLocal(display);
            e.currentTarget.blur();
          }
        }}
      />
    </div>
  );
}

function PropertiesBody({ selection }: { selection: SelectionSnapshot }) {
  const applyToSelection = useCanvasStore((s) => s.applyToSelection);
  const apply = (patch: SelectionPatch) => applyToSelection(patch);

  return (
    <div className="grid gap-3.5 p-3">
      <div className="grid gap-2">
        <div className="font-mono text-[9px] tracking-[0.2em] text-fg-dim uppercase">TRANSFORM</div>
        <div className="grid grid-cols-2 gap-1.5">
          <NumberField symbol="X" value={selection.left} onCommit={(v) => apply({ left: v })} />
          <NumberField symbol="Y" value={selection.top} onCommit={(v) => apply({ top: v })} />
          <NumberField symbol="W" value={selection.width} onCommit={(v) => apply({ width: v })} />
          <NumberField symbol="H" value={selection.height} onCommit={(v) => apply({ height: v })} />
          <NumberField
            symbol="∠"
            value={selection.angle}
            suffix="°"
            onCommit={(v) => apply({ angle: v })}
          />
        </div>
      </div>

      <div className="grid gap-2">
        <div className="font-mono text-[9px] tracking-[0.2em] text-fg-dim uppercase">FILL</div>
        <ColorField value={selection.fill} onCommit={(v) => apply({ fill: v })} />
      </div>

      <div className="grid gap-2">
        <div className="font-mono text-[9px] tracking-[0.2em] text-fg-dim uppercase">STROKE</div>
        <ColorField value={selection.stroke} onCommit={(v) => apply({ stroke: v })} />
        <Slider
          value={selection.strokeWidth}
          onChange={(v) => apply({ strokeWidth: v })}
          min={0}
          max={20}
          suffix=" PX"
        />
      </div>

      <div className="grid gap-2">
        <div className="font-mono text-[9px] tracking-[0.2em] text-fg-dim uppercase">
          APPEARANCE
        </div>
        <div className="flex items-center gap-2">
          <span className="w-15 font-mono text-[9px] tracking-[0.2em] text-fg-dim uppercase">
            OPACITY
          </span>
          <Slider
            value={Math.round(selection.opacity * 100)}
            onChange={(v) => apply({ opacity: v / 100 })}
            suffix="%"
          />
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full items-center justify-center px-3 py-6 text-center font-mono text-[10px] tracking-mono text-fg-dimmer uppercase">
      Select an object to edit
    </div>
  );
}

export function PropertiesPanel({ className }: { className?: string } = {}) {
  const selection = useCanvasStore((s) => s.selection);
  const meta = selection ? (TYPE_LABELS[selection.type] ?? selection.type.toUpperCase()) : null;

  return (
    <Panel className={className}>
      <PanelHeader title="PROPERTIES" right={meta ? <span>{meta}</span> : null} />
      <PanelBody>{selection ? <PropertiesBody selection={selection} /> : <EmptyState />}</PanelBody>
    </Panel>
  );
}
