import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';

type RootProps = {
  className?: string;
  children: ReactNode;
};

const TwoColumnCard = ({ className, children }: RootProps) => {
  return (
    <div
      className={cn(
        'relative grid w-full max-w-245 grid-cols-1 border border-hairline bg-raised/55 backdrop-blur-card md:grid-cols-[1.05fr_1fr]',
        className,
      )}
    >
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
        'bg-card-art-fade relative hidden min-h-135 overflow-hidden border-hairline md:block md:border-l',
        className,
      )}
    >
      {children}
    </div>
  );
};

export { TwoColumnCard, TwoColumnCardForm, TwoColumnCardArt };
