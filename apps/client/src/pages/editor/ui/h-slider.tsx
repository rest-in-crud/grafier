import { useCallback, useEffect, useRef } from 'react';

type HSliderProps = {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  compact?: boolean;
};

const HSlider = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  suffix = '',
  compact = false,
}: HSliderProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const update = useCallback(
    (e: MouseEvent) => {
      if (!ref.current) return;
      const r = ref.current.getBoundingClientRect();
      const t = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
      let v = min + t * (max - min);
      v = Math.round(v / step) * step;
      onChange(v);
    },
    [onChange, min, max, step],
  );

  useEffect(() => {
    function move(e: MouseEvent) {
      if (dragging.current) update(e);
    }
    function up() {
      dragging.current = false;
    }
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
  }, [update]);

  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div
      ref={ref}
      className={`group relative cursor-pointer select-none ${compact ? 'w-22.5' : 'w-32.5'} h-5.5`}
      onMouseDown={(e) => {
        dragging.current = true;
        update(e.nativeEvent);
      }}
    >
      <div className="absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2 bg-hairline-strong" />
      <div
        className="absolute top-1/2 left-0 h-0.5 -translate-y-1/2 bg-foreground"
        style={{ width: `${pct}%` }}
      />
      <div
        className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-foreground bg-background transition-transform duration-100 group-hover:scale-[1.15]"
        style={{ left: `${pct}%` }}
      />
      <div
        className={`absolute top-1/2 -translate-y-1/2 font-mono text-[10px] text-fg-dim ${compact ? '-right-9 w-8' : '-right-10.5 w-9.5'}`}
      >
        {Math.round(value)}
        {suffix}
      </div>
    </div>
  );
};

export { HSlider };
