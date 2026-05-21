import { useRef, useState } from 'react';
import { Swatch } from './swatch';

export type ColorFieldProps = {
  value: string | null;
  onCommit: (color: string) => void;
};

function toPickerValue(v: string | null): string {
  if (!v) return '#000000';
  return /^#[0-9a-fA-F]{6}$/.test(v) ? v.toLowerCase() : '#000000';
}

export function ColorField({ value, onCommit }: ColorFieldProps) {
  const display = value ?? 'NONE';
  const [local, setLocal] = useState(display);
  const [prevDisplay, setPrevDisplay] = useState(display);
  const pickerRef = useRef<HTMLInputElement>(null);

  if (display !== prevDisplay) {
    setPrevDisplay(display);
    setLocal(display);
  }

  const commitText = () => {
    const trimmed = local.trim();
    if (trimmed !== (value ?? '') && trimmed.length > 0 && trimmed !== 'NONE') {
      onCommit(trimmed);
    } else {
      setLocal(display);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative shrink-0 cursor-pointer" onClick={() => pickerRef.current?.click()}>
        <Swatch
          color={value ?? undefined}
          style={value === null ? { background: 'transparent', borderStyle: 'dashed' } : undefined}
        />
        <input
          ref={pickerRef}
          type="color"
          className="absolute inset-0 h-0 w-0 cursor-pointer opacity-0"
          value={toPickerValue(local)}
          onChange={(e) => {
            setLocal(e.target.value);
            onCommit(e.target.value);
          }}
        />
      </div>
      <input
        className="flex-1 border border-hairline bg-field px-2 py-1.25 text-[11px] text-foreground focus:border-foreground focus:outline-none"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={commitText}
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
