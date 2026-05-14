import * as React from 'react';

import { cn } from '@/shared/lib/utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'w-full min-w-0 rounded-none border border-border bg-input px-[14px] py-[12px] text-base transition-colors outline-none placeholder:text-muted-foreground hover:bg-muted focus-visible:border-foreground focus-visible:bg-foreground/[0.03] focus-visible:ring-0 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/20 md:text-sm',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
