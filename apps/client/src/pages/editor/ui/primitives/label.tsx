import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';

type LabelProps = {
  children: ReactNode;
  className?: string;
};

export function Label({ children, className }: LabelProps) {
  return (
    <span className={cn('font-mono text-[10px] tracking-mono text-fg-dim uppercase', className)}>
      {children}
    </span>
  );
}
