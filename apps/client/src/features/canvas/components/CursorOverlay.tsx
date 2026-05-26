import { useCanvasStore } from '@/features/canvas/store/canvas.store';

const SIZING_TOOLS = new Set<string>(['pencil', 'brush', 'eraser']);

type Props = { x: number; y: number };

export function CursorOverlay({ x, y }: Props) {
  const activeTool = useCanvasStore((s) => s.activeTool);
  const toolStyles = useCanvasStore((s) => s.toolStyles);
  const zoom = useCanvasStore((s) => s.zoom);

  if (!SIZING_TOOLS.has(activeTool)) return null;

  const rawSize =
    activeTool === 'eraser'
      ? (toolStyles.eraser?.size ?? 20)
      : activeTool === 'brush'
        ? (toolStyles.brush?.width ?? 8)
        : (toolStyles.pencil?.width ?? 2);

  const diameter = Math.max(4, rawSize * (zoom / 100));
  const r = diameter / 2;
  const pad = 2;
  const size = diameter + pad * 2;
  const c = size / 2;

  return (
    <div
      className="pointer-events-none absolute z-50"
      style={{ left: x - c, top: y - c, width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        fill="none"
        style={{ display: 'block', filter: 'drop-shadow(0 0 1px rgba(0,0,0,0.85))' }}
      >
        <circle cx={c} cy={c} r={r} stroke="rgba(255,255,255,0.9)" strokeWidth={1} />
      </svg>
    </div>
  );
}
