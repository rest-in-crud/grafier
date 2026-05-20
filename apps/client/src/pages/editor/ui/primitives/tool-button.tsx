import type { MouseEvent as ReactMouseEvent, ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';

type ToolButtonProps = {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
  onMouseEnter: (e: ReactMouseEvent<HTMLButtonElement>) => void;
  onMouseLeave: () => void;
  ariaLabel: string;
  disabled?: boolean;
};

const toolBtn = 'relative flex h-10 w-10 items-center justify-center border';
const toolBtnActive = 'border-transparent bg-foreground text-background cursor-pointer';
const toolBtnInactive =
  'border-transparent bg-transparent text-muted-foreground hover:bg-field-hover hover:text-foreground cursor-pointer';
const toolBtnDisabled = 'border-transparent bg-transparent text-fg-dimmer cursor-not-allowed';
const cornerMark =
  'absolute right-0.5 bottom-0.5 h-0 w-0 border-l-4 border-b-4 border-l-transparent border-b-current';

export function ToolButton({
  active,
  children,
  onClick,
  onMouseEnter,
  onMouseLeave,
  ariaLabel,
  disabled = false,
}: ToolButtonProps) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      className={cn(toolBtn, disabled ? toolBtnDisabled : active ? toolBtnActive : toolBtnInactive)}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
      <span className={cornerMark} />
    </button>
  );
}
