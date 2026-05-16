import { useEffect, useRef } from 'react';

type Piece = 'sphere' | 'path' | 'polygon';

function bezierSphereFrame(t: number, cols = 56, rows = 30): string {
  const out: string[] = [];
  const cx = cols / 2;
  const cy = rows / 2;
  for (let y = 0; y < rows; y++) {
    let line = '';
    for (let x = 0; x < cols; x++) {
      const px = (x - cx) / (cols / 2);
      const py = ((y - cy) / (rows / 2)) * 1.8;
      const d = Math.sqrt(px * px + py * py);
      if (d > 1.05) {
        line += ' ';
        continue;
      }
      const lat = Math.asin(py / Math.max(0.0001, Math.sqrt(1 - px * px)));
      const lon = Math.atan2(px, Math.sqrt(Math.max(0.0001, 1 - px * px - py * py))) + t * 0.25;
      const latFrac = (lat / (Math.PI / 2)) * 7;
      const lonFrac = (lon / Math.PI) * 10;
      const latNear = Math.abs(latFrac - Math.round(latFrac));
      const lonNear = Math.abs(lonFrac - Math.round(lonFrac));
      if (d > 1.0) {
        line += '·';
        continue;
      }
      if (latNear < 0.05) line += '-';
      else if (lonNear < 0.03) line += '|';
      else if (Math.abs(d - 0.5) < 0.02) line += '·';
      else line += ' ';
    }
    out.push(line);
  }
  return out.join('\n');
}

function bezierPathFrame(t: number, cols = 56, rows = 30): string {
  const grid = Array.from({ length: rows }, () => Array(cols).fill(' '));
  const p0 = { x: 6, y: rows - 5 };
  const p1 = { x: 16 + Math.sin(t * 0.7) * 4, y: 4 + Math.cos(t * 0.9) * 2 };
  const p2 = {
    x: cols - 16 + Math.sin(t * 0.6 + 1) * 4,
    y: rows - 4 + Math.cos(t * 0.8 + 1) * 2,
  };
  const p3 = { x: cols - 6, y: 6 };
  const cubic = (a: number, b: number, c: number, e: number, u: number) => {
    const iu = 1 - u;
    return iu * iu * iu * a + 3 * iu * iu * u * b + 3 * iu * u * u * c + u * u * u * e;
  };
  for (let i = 0; i <= 120; i++) {
    const u = i / 120;
    const x = Math.round(cubic(p0.x, p1.x, p2.x, p3.x, u));
    const y = Math.round(cubic(p0.y, p1.y, p2.y, p3.y, u));
    if (y >= 0 && y < rows && x >= 0 && x < cols) {
      const slope =
        Math.abs(cubic(p0.y, p1.y, p2.y, p3.y, u + 0.01) - cubic(p0.y, p1.y, p2.y, p3.y, u)) > 0.4;
      grid[y][x] = i % 8 === 0 ? '·' : slope ? '/' : '-';
    }
  }
  const drawDashed = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    for (let i = 0; i <= 24; i += 2) {
      const u = i / 24;
      const x = Math.round(a.x + (b.x - a.x) * u);
      const y = Math.round(a.y + (b.y - a.y) * u);
      if (y >= 0 && y < rows && x >= 0 && x < cols && grid[y][x] === ' ') grid[y][x] = '·';
    }
  };
  drawDashed(p0, p1);
  drawDashed(p3, p2);
  const placeAnchor = (p: { x: number; y: number }, ch: string) => {
    const x = Math.round(p.x);
    const y = Math.round(p.y);
    if (y >= 0 && y < rows && x >= 0 && x < cols) grid[y][x] = ch;
  };
  placeAnchor(p0, '◦');
  placeAnchor(p3, '◦');
  placeAnchor(p1, '□');
  placeAnchor(p2, '□');
  const label = '[ BEZIER.PATH ]';
  for (let i = 0; i < label.length; i++) {
    if (label[i] !== ' ') grid[rows - 1][2 + i] = label[i];
  }
  return grid.map((r) => r.join('')).join('\n');
}

function polygonFrame(t: number, cols = 56, rows = 30): string {
  const grid = Array.from({ length: rows }, () => Array(cols).fill(' '));
  const cx = cols / 2;
  const cy = rows / 2;
  const layers = [
    { r: 12, sides: 6, rot: t * 0.2, ch: '·' },
    { r: 9, sides: 4, rot: -t * 0.3 + 0.4, ch: '-' },
    { r: 6, sides: 3, rot: t * 0.4, ch: '+' },
  ];
  for (const L of layers) {
    for (let s = 0; s < L.sides; s++) {
      const a1 = (s / L.sides) * Math.PI * 2 + L.rot;
      const a2 = ((s + 1) / L.sides) * Math.PI * 2 + L.rot;
      const x1 = cx + Math.cos(a1) * L.r * 2;
      const y1 = cy + Math.sin(a1) * L.r;
      const x2 = cx + Math.cos(a2) * L.r * 2;
      const y2 = cy + Math.sin(a2) * L.r;
      for (let i = 0; i <= 40; i++) {
        const u = i / 40;
        const x = Math.round(x1 + (x2 - x1) * u);
        const y = Math.round(y1 + (y2 - y1) * u);
        if (y >= 0 && y < rows && x >= 0 && x < cols) grid[y][x] = L.ch;
      }
    }
  }
  if (Math.floor(cy) < rows && Math.floor(cx) < cols) {
    grid[Math.floor(cy)][Math.floor(cx)] = '◦';
  }
  return grid.map((r) => r.join('')).join('\n');
}

const FRAME: Record<Piece, (t: number) => string> = {
  sphere: (t) => bezierSphereFrame(t),
  path: (t) => bezierPathFrame(t),
  polygon: (t) => polygonFrame(t),
};

const AsciiArt = ({ piece }: { piece: Piece }) => {
  const preRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    const pre = preRef.current;
    if (!pre) return;
    const frame = FRAME[piece];
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    let rafId = 0;
    let start = 0;

    const tick = (now: number) => {
      if (!start) start = now;
      pre.textContent = frame((now - start) / 1000);
      rafId = requestAnimationFrame(tick);
    };
    const apply = () => {
      cancelAnimationFrame(rafId);
      start = 0;
      if (mql.matches) pre.textContent = frame(0);
      else rafId = requestAnimationFrame(tick);
    };

    apply();
    mql.addEventListener('change', apply);
    return () => {
      cancelAnimationFrame(rafId);
      mql.removeEventListener('change', apply);
    };
  }, [piece]);

  return (
    <div className="grid h-full place-items-center">
      <pre
        ref={preRef}
        aria-hidden
        className="select-none font-mono text-[10px] leading-[1.05] text-muted-foreground/70"
      />
    </div>
  );
};

export { AsciiArt };
export type { Piece };
