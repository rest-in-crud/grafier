import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';
import { Label } from './label';

type FieldProps = {
  label: string;
  children: ReactNode;
  className?: string;
};

export function Field({ label, children, className }: FieldProps) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}
