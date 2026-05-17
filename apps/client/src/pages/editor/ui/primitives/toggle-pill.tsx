import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';

export type ToggleOption<T extends string> = {
  value: T;
  label: ReactNode;
  style?: CSSProperties;
};

type TogglePillProps<T extends string> = {
  options: ToggleOption<T>[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
};

const togglePill = 'inline-flex border border-hairline-strong';

const pillBtn = [
  'bg-transparent border-0 text-fg-dim',
  'font-mono text-[10px] tracking-[0.1em]',
  'py-1 px-2.5 cursor-pointer',
  'border-r border-hairline last:border-r-0',
].join(' ');

const pillBtnOn = pillBtn + ' !bg-foreground !text-background';

export function TogglePill<T extends string>({
  options,
  value,
  onChange,
  className,
}: TogglePillProps<T>) {
  return (
    <div className={cn(togglePill, className)}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={opt.value === value ? pillBtnOn : pillBtn}
          style={opt.style}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
