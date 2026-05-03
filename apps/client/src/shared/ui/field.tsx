import { cloneElement, isValidElement, useId } from 'react';
import type { ReactNode } from 'react';
import { Label } from '@/shared/ui/label';

type FieldProps = {
  label: string;
  error?: string;
  hint?: string;
  hintAction?: ReactNode;
  children: ReactNode;
};

const Field = ({ label, error, hint, hintAction, children }: FieldProps) => {
  const id = useId();
  const childWithId = isValidElement<{ id?: string }>(children)
    ? cloneElement(children, { id })
    : children;

  return (
    <div className="mb-4 flex flex-col gap-2">
      <Label htmlFor={id}>
        <span>{label}</span>
        {hintAction ? (
          <span className="normal-case tracking-hint">{hintAction}</span>
        ) : (
          hint && <span className="normal-case tracking-hint">{hint}</span>
        )}
      </Label>

      {childWithId}

      {error && (
        <div role="alert" className="font-mono text-2xs uppercase tracking-mono text-destructive">
          {error}
        </div>
      )}
    </div>
  );
};

export { Field };
