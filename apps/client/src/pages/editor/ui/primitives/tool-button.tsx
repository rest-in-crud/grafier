import type { MouseEvent as ReactMouseEvent, ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';

type ToolButtonProps = {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
  onMouseEnter: (e: ReactMouseEvent<HTMLButtonElement>) => void;
  onMouseLeave: () => void;
};

const toolBtn = 'relative flex h-10 w-10 cursor-pointer items-center justify-center border';
const toolBtnActive = 'border-transparent bg-foreground text-background';
const toolBtnInactive =
  'border-transparent bg-transparent text-muted-foreground hover:bg-field-hover hover:text-foreground';
const cornerMark =
  'absolute right-0.5 bottom-0.5 h-0 w-0 border-l-4 border-b-4 border-l-transparent border-b-current';

export function ToolButton({
  active,
  children,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: ToolButtonProps) {
  return (
    <button
      type="button"
      className={cn(toolBtn, active ? toolBtnActive : toolBtnInactive)}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
      <span className={cornerMark} />
    </button>
  );
}
