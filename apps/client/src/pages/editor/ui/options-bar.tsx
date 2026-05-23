import { useCanvasStore } from '@/features/canvas/store/canvas.store';
import { PEN_DEFAULT_STYLES } from '@/features/canvas/lib/tools/PenTool/PenTool.styles';
import {
  CLOSED_SHAPE_STYLE,
  SHAPE_OPTIONS,
} from '@/features/canvas/lib/tools/ShapeTool/shape.config';
import type { ShapeType } from '@/features/canvas/lib/tools/ShapeTool/shape.config';
import {
  DEFAULT_TEXT_FONT_FAMILY,
  DEFAULT_TEXT_FONT_WEIGHT,
  GOOGLE_TEXT_FONTS,
  GOOGLE_TEXT_FONT_WEIGHTS,
} from '@/features/canvas/lib/tools/TextTool/googleFonts';
import { TEXT_DEFAULT_STYLES } from '@/features/canvas/lib/tools/TextTool/TextTool';
import { ERASER_DEFAULT_STYLES } from '@/features/canvas/lib/tools/EraserTool/EraserTool';
import type { ToolId } from '../types';
import { ColorField, Field, Label, Select, Separator, Slider, TogglePill } from './primitives';
import type { ToggleOption } from './primitives';

type Props = { tool: ToolId };

const optionsBar =
  'flex items-center h-[40px] overflow-hidden border-b border-hairline bg-chrome px-3.5 gap-[24px] text-xs';

function PencilOptions() {
  const styles = useCanvasStore((s) => s.toolStyles.pencil);
  const setToolStyle = useCanvasStore((s) => s.setToolStyle);

  const color = styles?.color ?? PEN_DEFAULT_STYLES.color;
  const width = styles?.width ?? PEN_DEFAULT_STYLES.width;
  const opacity = styles?.opacity ?? PEN_DEFAULT_STYLES.opacity;

  return (
    <>
      <Label>Pencil</Label>
      <Separator />
      <Field label="Color">
        <ColorField value={color} onCommit={(v) => setToolStyle('pencil', { color: v })} />
      </Field>
      <Separator />
      <Field label="Width">
        <Slider
          value={width}
          onChange={(v) => setToolStyle('pencil', { width: v })}
          min={1}
          max={200}
          suffix=" PX"
        />
      </Field>
      <Separator />
      <Field label="Opacity">
        <Slider
          value={opacity}
          onChange={(v) => setToolStyle('pencil', { opacity: v })}
          suffix="%"
        />
      </Field>
    </>
  );
}

function EraserOptions() {
  const styles = useCanvasStore((s) => s.toolStyles.eraser);
  const setToolStyle = useCanvasStore((s) => s.setToolStyle);

  const size = styles?.size ?? ERASER_DEFAULT_STYLES.size;

  return (
    <>
      <Label>Eraser</Label>
      <Separator />
      <Field label="Size">
        <Slider
          value={size}
          onChange={(v) => setToolStyle('eraser', { size: v })}
          min={1}
          max={200}
          suffix=" PX"
        />
      </Field>
    </>
  );
}

const SHAPE_PILL_OPTIONS: ToggleOption<ShapeType>[] = SHAPE_OPTIONS.map((s) => ({
  value: s.type,
  label: s.label.toUpperCase(),
}));

function ShapeOptions() {
  const activeShape = useCanvasStore((s) => s.activeShape);
  const setActiveShape = useCanvasStore((s) => s.setActiveShape);
  const styles = useCanvasStore((s) => s.toolStyles.shape);
  const setToolStyle = useCanvasStore((s) => s.setToolStyle);

  const strokeWidth = styles?.strokeWidth ?? CLOSED_SHAPE_STYLE.strokeWidth;

  return (
    <>
      <Label>Shape</Label>
      <Separator />
      <TogglePill options={SHAPE_PILL_OPTIONS} value={activeShape} onChange={setActiveShape} />
      <Separator />
      <Field label="Stroke">
        <Slider
          value={strokeWidth}
          onChange={(v) => setToolStyle('shape', { strokeWidth: v })}
          min={0}
          max={20}
          suffix=" PX"
          compact
        />
      </Field>
    </>
  );
}

const FONT_FAMILY_OPTIONS: string[] = [...GOOGLE_TEXT_FONTS];
const FONT_WEIGHT_OPTIONS: string[] = [...GOOGLE_TEXT_FONT_WEIGHTS];

function TextOptions() {
  const styles = useCanvasStore((s) => s.toolStyles.text);
  const setToolStyle = useCanvasStore((s) => s.setToolStyle);

  const fontFamily = styles?.fontFamily ?? DEFAULT_TEXT_FONT_FAMILY;
  const fontWeight = styles?.fontWeight ?? DEFAULT_TEXT_FONT_WEIGHT;
  const fontSize = styles?.fontSize ?? TEXT_DEFAULT_STYLES.fontSize;

  return (
    <>
      <Label>Type</Label>
      <Separator />
      <Field label="Font">
        <Select
          options={FONT_FAMILY_OPTIONS}
          value={fontFamily}
          onChange={(v) => setToolStyle('text', { fontFamily: v })}
        />
      </Field>
      <Field label="Weight">
        <Select
          options={FONT_WEIGHT_OPTIONS}
          value={fontWeight}
          onChange={(v) => setToolStyle('text', { fontWeight: v })}
        />
      </Field>
      <Field label="Size">
        <Slider
          value={fontSize}
          onChange={(v) => setToolStyle('text', { fontSize: v })}
          min={6}
          max={400}
          suffix=" PT"
          compact
        />
      </Field>
    </>
  );
}

function HandOptions() {
  return (
    <>
      <Label>Hand</Label>
      <Separator />
      <span className="text-fg-dimmer text-2xs">Drag to pan · Space works in any tool</span>
    </>
  );
}

function EyedropperOptions() {
  const eyedropperColor = useCanvasStore((s) => s.eyedropperColor);

  return (
    <>
      <Label>Eyedropper</Label>
      <Separator />
      {eyedropperColor ? (
        <Field label="Picked">
          <div className="flex items-center gap-2">
            <div
              className="size-3.5 shrink-0 border border-hairline-strong"
              style={{ backgroundColor: eyedropperColor }}
            />
            <span className="font-mono text-[10px] text-fg-dim">{eyedropperColor.toUpperCase()}</span>
          </div>
        </Field>
      ) : (
        <span className="text-fg-dimmer text-2xs">Click on the canvas to pick a color</span>
      )}
    </>
  );
}

function SelectionOptions() {
  return (
    <>
      <Label>Selection</Label>
      <Separator />
      <span className="text-fg-dimmer text-2xs">Select an object to edit its properties</span>
    </>
  );
}

export function OptionsBar({ tool }: Props) {
  return (
    <div className={optionsBar}>
      {tool === 'pencil' ? (
        <PencilOptions />
      ) : tool === 'eraser' ? (
        <EraserOptions />
      ) : tool === 'shape' ? (
        <ShapeOptions />
      ) : tool === 'text' ? (
        <TextOptions />
      ) : tool === 'dropper' ? (
        <EyedropperOptions />
      ) : tool === 'hand' ? (
        <HandOptions />
      ) : (
        <SelectionOptions />
      )}
    </div>
  );
}
