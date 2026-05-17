import { cn } from '@/shared/lib/utils';

type SeparatorProps = {
  orientation?: 'vertical' | 'horizontal';
  className?: string;
};

export function Separator({ orientation = 'vertical', className }: SeparatorProps) {
  if (orientation === 'horizontal') {
    return <div className={cn('h-px bg-hairline shrink-0', className)} aria-hidden />;
  }
  return <div className={cn('w-px h-5 bg-hairline shrink-0', className)} aria-hidden />;
}
