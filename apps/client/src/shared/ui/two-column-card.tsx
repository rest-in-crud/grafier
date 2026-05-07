import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';

const CORNERS = [
  '-left-px -top-px border-l border-t',
  '-right-px -top-px border-r border-t',
  '-bottom-px -left-px border-b border-l',
  '-bottom-px -right-px border-b border-r',
] as const;

type RootProps = {
  className?: string;
  children: ReactNode;
};

const TwoColumnCard = ({ className, children }: RootProps) => {
  return (
    <div
      className={cn(
        'relative grid w-full max-w-245 grid-cols-1 border border-(--hairline) bg-black/55 backdrop-blur-md md:grid-cols-[1.05fr_1fr]',
        className,
      )}
    >
      {CORNERS.map((cls) => (
        <span key={cls} aria-hidden className={cn('absolute size-3.5 border-foreground', cls)} />
      ))}
      {children}
    </div>
  );
};

type SideProps = {
  className?: string;
  children: ReactNode;
};

const TwoColumnCardForm = ({ className, children }: SideProps) => {
  return (
    <div className={cn('flex min-h-135 flex-col px-11 pb-10 pt-11', className)}>{children}</div>
  );
};

const TwoColumnCardArt = ({ className, children }: SideProps) => {
  return (
    <div
      className={cn(
        'bg-card-art-fade relative hidden min-h-135 overflow-hidden border-(--hairline) md:block md:border-l',
        className,
      )}
    >
      {children}
    </div>
  );
};

export { TwoColumnCard, TwoColumnCardForm, TwoColumnCardArt };
