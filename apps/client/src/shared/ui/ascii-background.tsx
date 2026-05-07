import { useAnimatedCanvas, type Renderer } from '@/shared/lib/use-animated-canvas';

const CHARS = [
  ' ',
  ' ',
  ' ',
  ' ',
  ' ',
  '.',
  '.',
  "'",
  '`',
  '·',
  '·',
  ':',
  '-',
  '+',
  '/',
  '\\',
  '|',
  '=',
  '*',
  '×',
  '◦',
  '○',
  '□',
  '△',
];
const CELL = 14;

const hash = (x: number, y: number) => {
  const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return n - Math.floor(n);
};

const drawAsciiFrame: Renderer = (ctx, { time, width, height }) => {
  const cols = Math.ceil(width / CELL) + 2;
  const rows = Math.ceil(height / CELL) + 2;
  ctx.font = '11px "JetBrains Mono Variable", monospace';
  ctx.textBaseline = 'top';

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const nx = x / cols;
      const ny = y / rows;
      const wave = Math.sin(nx * 6 + time * 0.25) * 0.5 + Math.cos(ny * 5 - time * 0.18) * 0.5;
      const dx = nx - 0.5;
      const dy = ny - 0.5;
      const distCenter = Math.sqrt(dx * dx + dy * dy);

      const hseed = hash(x + Math.floor(time * 0.3), y + Math.floor(time * 0.25));
      const density = (wave * 0.5 + 0.5) * (1 - distCenter * 1.1) - 0.15;
      if (density < hseed * 0.9) continue;

      const ch = CHARS[Math.floor(hseed * CHARS.length)];
      if (ch === ' ') continue;

      const alpha = Math.max(0.04, Math.min(0.55, 0.22 - distCenter * 0.25));
      ctx.fillStyle = `rgba(235, 235, 235, ${alpha})`;
      ctx.fillText(ch, x * CELL, y * CELL);
    }
  }
};

const AsciiBackground = () => {
  const ref = useAnimatedCanvas(drawAsciiFrame);
  return <canvas ref={ref} aria-hidden className="pointer-events-none absolute inset-0" />;
};

export { AsciiBackground };
