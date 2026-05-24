const COLS = 48;
const ROWS = 16;

const CURVE_GLYPHS = ['*', '+', 'o', '.', '#', '~'];

const hashString = (s: string): number => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1) {
    h = (h ^ s.charCodeAt(i)) * 16777619;
    h |= 0;
  }
  return Math.abs(h);
};

const jitter = (h: number, range: number): number => (h % (range * 2 + 1)) - range;

const placeholderThumb = (seed = ''): string => {
  const grid: string[][] = Array.from({ length: ROWS }, () => Array<string>(COLS).fill(' '));
  const h = hashString(seed);
  const glyph = CURVE_GLYPHS[h % CURVE_GLYPHS.length];
  const flip = (h >> 3) % 2 === 1;

  const points: [number, number][] = [
    [4 + jitter(h, 5), ROWS - 2 + jitter(h >> 5, 3)],
    [14 + jitter(h >> 7, 8), 1 + jitter(h >> 11, 4)],
    [COLS - 18 + jitter(h >> 13, 8), ROWS - 2 + jitter(h >> 17, 4)],
    [COLS - 4 + jitter(h >> 19, 5), 2 + jitter(h >> 23, 3)],
  ];

  if (flip) {
    for (const p of points) {
      p[0] = COLS - 1 - p[0];
    }
  }

  const [p0, p1, p2, p3] = points;

  for (let t = 0; t <= 1; t += 0.01) {
    const it = 1 - t;
    const x = it ** 3 * p0[0] + 3 * it ** 2 * t * p1[0] + 3 * it * t ** 2 * p2[0] + t ** 3 * p3[0];
    const y = it ** 3 * p0[1] + 3 * it ** 2 * t * p1[1] + 3 * it * t ** 2 * p2[1] + t ** 3 * p3[1];
    const ix = Math.round(x);
    const iy = Math.round(y);
    if (ix >= 0 && ix < COLS && iy >= 0 && iy < ROWS) grid[iy][ix] = glyph;
  }

  for (let i = 0; i < points.length; i += 1) {
    const [x, y] = points[i];
    const ix = Math.round(x);
    const iy = Math.round(y);
    if (ix >= 0 && ix < COLS && iy >= 0 && iy < ROWS) {
      grid[iy][ix] = i === 0 || i === 3 ? '#' : '+';
    }
  }

  return grid.map((r) => r.join('')).join('\n');
};

export { placeholderThumb };
