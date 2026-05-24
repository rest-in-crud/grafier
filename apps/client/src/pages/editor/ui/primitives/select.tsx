import { cn } from '@/shared/lib/utils';

export type SelectOptionGroup = { group: string; items: readonly string[] };

export type EditorSelectProps = {
  options?: readonly string[];
  groups?: readonly SelectOptionGroup[];
  value?: string;
  defaultValue?: string;
  onChange?: (v: string) => void;
  className?: string;
};

const optSelect = [
  'editor-select',
  'bg-chrome border border-hairline-strong text-foreground',
  'font-mono text-[10px] tracking-[0.1em] uppercase',
  'py-1 pl-2 pr-[22px] cursor-pointer',
  'focus:outline-none focus:border-foreground',
].join(' ');

export function Select({
  options,
  groups,
  value,
  defaultValue,
  onChange,
  className,
}: EditorSelectProps) {
  const controlled = value !== undefined;

  return (
    <select
      className={cn(optSelect, className)}
      {...(controlled
        ? { value, onChange: (e) => onChange?.(e.target.value) }
        : { defaultValue, onChange: (e) => onChange?.(e.target.value) })}
    >
      {groups
        ? groups.map((g) => (
            <optgroup key={g.group} label={g.group}>
              {g.items.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </optgroup>
          ))
        : (options ?? []).map((opt) => <option key={opt}>{opt}</option>)}
    </select>
  );
}
