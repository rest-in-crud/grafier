import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';

type IconButtonProps = {
  children: ReactNode;
  title?: string;
  onClick?: () => void;
  className?: string;
};

const iconBtn =
  'flex h-7 w-7 cursor-pointer items-center justify-center border border-transparent text-fg-dim transition-all duration-120 hover:border-hairline-strong hover:text-foreground';

export function IconButton({ children, title, onClick, className }: IconButtonProps) {
  return (
    <button type="button" title={title} onClick={onClick} className={cn(iconBtn, className)}>
      {children}
    </button>
  );
}
