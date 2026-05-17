import type { CSSProperties } from 'react';
import { cn } from '@/shared/lib/utils';

type SwatchProps = {
  color?: string;
  className?: string;
  style?: CSSProperties;
};

const colorSwatch = 'w-[22px] h-[22px] border border-hairline-strong shrink-0 cursor-pointer';

export function Swatch({ color, className, style }: SwatchProps) {
  return <div className={cn(colorSwatch, className)} style={{ background: color, ...style }} />;
}
