import { PencilBrush } from 'fabric';
import type { Canvas, Path } from 'fabric';
import type { BaseTool } from '../BaseTool';
import type { ToolRegistration } from '../types';
import { BRUSH_DEFAULT_STYLES, BRUSH_STYLE_SCHEMA } from './BrushTool.styles';
import type { BrushStyles } from './BrushTool.styles';
import { resolveStyles } from '@/features/canvas/shared/lib/resolveStyles';
import { hexToRgba } from '@/features/canvas/shared/lib/fabricHelpers';

type Pt = { x: number; y: number };
type PathCmd = [string, ...number[]];

function extractPoints(cmds: PathCmd[]): Pt[] {
  const pts: Pt[] = [];
  let firstQ = true;
  for (const cmd of cmds) {
    if (cmd[0] === 'M') {
      pts.push({ x: cmd[1], y: cmd[2] });
    } else if (cmd[0] === 'Q') {
      if (!firstQ) pts.push({ x: cmd[1], y: cmd[2] });
      firstQ = false;
    }
  }
  const last = cmds[cmds.length - 1];
  if (last && last[0] === 'L') pts.push({ x: last[1], y: last[2] });
  return pts;
}

function chaikin(pts: Pt[], iterations: number): Pt[] {
  let result = pts;
  for (let k = 0; k < iterations; k++) {
    const next: Pt[] = [result[0]];
    for (let i = 0; i < result.length - 1; i++) {
      const a = result[i];
      const b = result[i + 1];
      next.push(
        { x: 0.75 * a.x + 0.25 * b.x, y: 0.75 * a.y + 0.25 * b.y },
        { x: 0.25 * a.x + 0.75 * b.x, y: 0.25 * a.y + 0.75 * b.y },
      );
    }
    next.push(result[result.length - 1]);
    result = next;
  }
  return result;
}

function buildSmoothPath(pts: Pt[]): string {
  if (pts.length < 2) return `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;
  if (pts.length === 2) {
    return `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)} L ${pts[1].x.toFixed(2)} ${pts[1].y.toFixed(2)}`;
  }
  let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const mid = {
      x: (pts[i].x + pts[i + 1].x) / 2,
      y: (pts[i].y + pts[i + 1].y) / 2,
    };
    d += ` Q ${pts[i].x.toFixed(2)} ${pts[i].y.toFixed(2)} ${mid.x.toFixed(2)} ${mid.y.toFixed(2)}`;
  }
  d += ` L ${pts[pts.length - 1].x.toFixed(2)} ${pts[pts.length - 1].y.toFixed(2)}`;
  return d;
}

export class BrushTool implements BaseTool {
  defaultStyles = { ...BRUSH_DEFAULT_STYLES };
  styleSchema = BRUSH_STYLE_SCHEMA;

  private smoothing = BRUSH_DEFAULT_STYLES.smoothing;
  private width = BRUSH_DEFAULT_STYLES.width;
  private color = hexToRgba(BRUSH_DEFAULT_STYLES.color, BRUSH_DEFAULT_STYLES.opacity);

  private readonly onPathCreated = ({ path }: { path: Path }) => {
    const raw = path.path as unknown as PathCmd[];
    if (!raw || raw.length < 3) return;

    const pts = extractPoints(raw);
    if (pts.length < 2) return;

    const smooth = this.smoothing > 0 ? chaikin(pts, this.smoothing) : pts;
    const smoothSvg = buildSmoothPath(smooth);

    if ('_setPath' in path && typeof path._setPath === 'function') {
      (path._setPath as (d: unknown, adj: boolean) => void)(smoothSvg, true);
    }
    path.set({ stroke: this.color, strokeWidth: this.width, fill: null });
    path.dirty = true;
    path.setCoords();
    path.canvas?.requestRenderAll();
  };

  activate(canvas: Canvas, styles: Record<string, unknown> = {}) {
    const s = resolveStyles(styles, BRUSH_DEFAULT_STYLES) as BrushStyles;
    this.smoothing = s.smoothing;
    this.width = s.width;
    this.color = hexToRgba(s.color, s.opacity);

    const brush = new PencilBrush(canvas);
    brush.color = this.color;
    brush.width = s.width;
    brush.strokeLineCap = 'round';
    brush.strokeLineJoin = 'round';
    brush.decimate = 0.4;
    brush.limitedToCanvasSize = s.limitedToCanvasSize;

    canvas.freeDrawingBrush = brush;
    canvas.isDrawingMode = true;
    canvas.defaultCursor = 'crosshair';
    canvas.hoverCursor = canvas.defaultCursor;
    canvas.on('path:created', this.onPathCreated);
  }

  deactivate(canvas: Canvas) {
    canvas.off('path:created', this.onPathCreated);
    canvas.isDrawingMode = false;
  }

  suspend(canvas: Canvas) {
    canvas.isDrawingMode = false;
  }

  resume(canvas: Canvas) {
    canvas.isDrawingMode = true;
  }
}

const registration: ToolRegistration = { id: 'brush', tool: new BrushTool(), behavior: 'draw' };
export default registration;
