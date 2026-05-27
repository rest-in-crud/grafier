import { ComponentProps, useState } from 'react';
import { Input } from '@/shared/ui/input';
import { EyeIcon, EyeSlashIcon } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';

const PasswordInput = ({ className, ...props }: ComponentProps<typeof Input>) => {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <Input className={cn('pr-10', className)} {...props} type={show ? 'text' : 'password'} />
      <button
        type="button"
        aria-label={show ? 'Hide password' : 'Show password'}
        aria-pressed={show}
        onClick={() => setShow((s) => !s)}
        className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3 text-muted-foreground hover:text-foreground"
      >
        {show ? <EyeSlashIcon /> : <EyeIcon />}
      </button>
    </div>
  );
};

export { PasswordInput };
