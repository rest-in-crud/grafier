import type { CSSProperties } from 'react';
import { cn } from '@/shared/lib/utils';

type SwatchProps = {
  color?: string;
  className?: string;
  style?: CSSProperties;
  interactive?: boolean;
};

const colorSwatch = 'w-5.5 h-5.5 border border-hairline-strong shrink-0';

export function Swatch({ color, className, style, interactive = true }: SwatchProps) {
  return (
    <div
      className={cn(colorSwatch, interactive && 'cursor-pointer', className)}
      style={{ background: color, ...style }}
    />
  );
}
