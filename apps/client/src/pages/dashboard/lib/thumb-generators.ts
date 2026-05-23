const COLS = 48;
const ROWS = 16;

const placeholderThumb = (): string => {
  const grid: string[][] = Array.from({ length: ROWS }, () => Array<string>(COLS).fill(' '));

  const p0: [number, number] = [4, ROWS - 2];
  const p1: [number, number] = [14, 1];
  const p2: [number, number] = [COLS - 18, ROWS - 2];
  const p3: [number, number] = [COLS - 4, 2];

  for (let t = 0; t <= 1; t += 0.01) {
    const it = 1 - t;
    const x = it ** 3 * p0[0] + 3 * it ** 2 * t * p1[0] + 3 * it * t ** 2 * p2[0] + t ** 3 * p3[0];
    const y = it ** 3 * p0[1] + 3 * it ** 2 * t * p1[1] + 3 * it * t ** 2 * p2[1] + t ** 3 * p3[1];
    const ix = Math.round(x);
    const iy = Math.round(y);
    if (ix >= 0 && ix < COLS && iy >= 0 && iy < ROWS) grid[iy][ix] = '*';
  }

  [p0, p1, p2, p3].forEach(([x, y], i) => {
    const ix = Math.round(x);
    const iy = Math.round(y);
    if (ix >= 0 && ix < COLS && iy >= 0 && iy < ROWS) {
      grid[iy][ix] = i === 0 || i === 3 ? '#' : '+';
    }
  });

  return grid.map((r) => r.join('')).join('\n');
};

export { placeholderThumb };
