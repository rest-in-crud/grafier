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

type ChildProps = {
  id?: string;
  'aria-invalid'?: boolean;
  'aria-describedby'?: string;
};

const Field = ({ label, error, hint, hintAction, children }: FieldProps) => {
  const id = useId();
  const errorId = useId();
  const hintId = useId();

  const describedBy =
    [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined;

  const childWithProps = isValidElement<ChildProps>(children)
    ? cloneElement(children, {
        id,
        'aria-invalid': !!error,
        'aria-describedby': describedBy,
      })
    : children;

  return (
    <div className="mb-4 flex flex-col gap-2">
      <Label htmlFor={id}>
        <span>{label}</span>
        {hintAction ? (
          <span className="normal-case tracking-hint">{hintAction}</span>
        ) : (
          hint && (
            <span id={hintId} className="normal-case tracking-hint">
              {hint}
            </span>
          )
        )}
      </Label>

      {childWithProps}

      {error && (
        <div
          id={errorId}
          role="alert"
          className="font-mono text-2xs uppercase tracking-mono text-destructive"
        >
          {error}
        </div>
      )}
    </div>
  );
};

export { Field };
