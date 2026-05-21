import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';

type PanelProps = {
  children: ReactNode;
  className?: string;
};

export function Panel({ children, className }: PanelProps) {
  return <div className={cn('flex flex-col overflow-hidden', className)}>{children}</div>;
}

type PanelHeaderProps = {
  title: ReactNode;
  right?: ReactNode;
  className?: string;
};

export function PanelHeader({ title, right, className }: PanelHeaderProps) {
  return (
    <div
      className={cn(
        'font-mono flex items-center justify-between border-b border-hairline bg-background px-3 py-2 text-[10px] tracking-panel text-muted-foreground uppercase',
        className,
      )}
    >
      <span className="text-foreground">{title}</span>
      {right}
    </div>
  );
}

type PanelBodyProps = {
  children: ReactNode;
  className?: string;
};

export function PanelBody({ children, className }: PanelBodyProps) {
  return <div className={cn('flex-1 overflow-y-auto py-1.5', className)}>{children}</div>;
}
