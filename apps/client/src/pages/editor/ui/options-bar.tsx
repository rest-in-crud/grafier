import type { BlendMode, EditorOpts, ToolId } from '../types';
import type { ToggleOption } from './primitives';
import { Field, Label, Select, Separator, Slider, Swatch, TogglePill } from './primitives';

type Props = {
  tool: ToolId;
  opts: EditorOpts;
  setOpts: (o: EditorOpts) => void;
};

const optionsBar =
  'flex items-center h-[40px] overflow-hidden border-b border-hairline bg-chrome px-3.5 gap-[18px] text-xs';

const BLEND_OPTIONS = ['NORMAL', 'MULTIPLY', 'SCREEN', 'OVERLAY'] as const;
const FONT_OPTIONS = ['INTER', 'JETBRAINS MONO', 'SERIF'] as const;

type ToolOptionsProps = {
  opts: EditorOpts;
  update: <K extends keyof EditorOpts>(k: K, v: EditorOpts[K]) => void;
};

function PaintOptions({
  tool,
  opts,
  update,
}: ToolOptionsProps & { tool: 'brush' | 'pencil' | 'eraser' }) {
  const toolLabel = tool === 'brush' ? 'Brush' : tool === 'pencil' ? 'Pencil' : 'Eraser';
  return (
    <>
      <Label>{toolLabel}</Label>
      <Separator />
      <Field label="Size">
        <Slider
          value={opts.size}
          onChange={(v) => update('size', v)}
          min={1}
          max={200}
          suffix=" PX"
        />
      </Field>
      <Separator />
      <Field label="Opacity">
        <Slider value={opts.opacity} onChange={(v) => update('opacity', v)} suffix="%" />
      </Field>
      <Separator />
      <Field label="Hardness">
        <Slider value={opts.hardness} onChange={(v) => update('hardness', v)} suffix="%" compact />
      </Field>
      <Separator />
      <Field label="Blend">
        <Select
          options={BLEND_OPTIONS}
          value={opts.blend}
          onChange={(v) => update('blend', v as BlendMode)}
        />
      </Field>
    </>
  );
}

const SHAPE_PILL_OPTIONS: ToggleOption<string>[] = [
  { value: 'RECT', label: 'RECT' },
  { value: 'ELLIPSE', label: 'ELLIPSE' },
  { value: 'POLY', label: 'POLY' },
  { value: 'LINE', label: 'LINE' },
];

function ShapeOptions({ opts, update }: ToolOptionsProps) {
  return (
    <>
      <Label>Shape</Label>
      <Separator />
      <TogglePill options={SHAPE_PILL_OPTIONS} value="RECT" onChange={(_v: string) => {}} />
      <Separator />
      <Field label="Fill">
        <Swatch color="#e8e8e8" />
      </Field>
      <Field label="Stroke">
        <Swatch color="#000" style={{ borderColor: 'var(--fg)' }} />
        <Slider
          value={opts.stroke}
          onChange={(v) => update('stroke', v)}
          min={0}
          max={20}
          suffix=" PX"
          compact
        />
      </Field>
    </>
  );
}

const TEXT_STYLE_OPTIONS: ToggleOption<string>[] = [
  { value: 'B', label: 'B', style: { fontWeight: 700 } },
  { value: 'I', label: 'I', style: { fontStyle: 'italic' } },
  { value: 'U', label: 'U', style: { textDecoration: 'underline' } },
];

const TEXT_ALIGN_OPTIONS: ToggleOption<string>[] = [
  { value: 'L', label: 'L' },
  { value: 'C', label: 'C' },
  { value: 'R', label: 'R' },
  { value: 'J', label: 'J' },
];

function TextOptions() {
  return (
    <>
      <Label>Type</Label>
      <Separator />
      <Select options={FONT_OPTIONS} defaultValue="INTER" />
      <Field label="Size">
        <Slider value={48} onChange={(_v: number) => {}} min={6} max={400} suffix=" PT" compact />
      </Field>
      <TogglePill options={TEXT_STYLE_OPTIONS} value="B" onChange={(_v: string) => {}} />
      <TogglePill options={TEXT_ALIGN_OPTIONS} value="L" onChange={(_v: string) => {}} />
    </>
  );
}

const AUTO_SELECT_OPTIONS: ToggleOption<string>[] = [
  { value: 'LAYER', label: 'LAYER' },
  { value: 'GROUP', label: 'GROUP' },
];

const SHOW_BOUNDS_OPTIONS: ToggleOption<string>[] = [
  { value: 'ON', label: 'ON' },
  { value: 'OFF', label: 'OFF' },
];

const ALIGN_OPTIONS: ToggleOption<string>[] = [
  { value: 'L', label: 'L' },
  { value: 'C', label: 'C' },
  { value: 'R', label: 'R' },
  { value: 'T', label: 'T' },
  { value: 'M', label: 'M' },
  { value: 'B', label: 'B' },
];

function SelectionOptions() {
  return (
    <>
      <Label>Selection</Label>
      <Separator />
      <Field label="Auto-Select">
        <TogglePill options={AUTO_SELECT_OPTIONS} value="LAYER" onChange={(_v: string) => {}} />
      </Field>
      <Separator />
      <Field label="Show Bounds">
        <TogglePill options={SHOW_BOUNDS_OPTIONS} value="ON" onChange={(_v: string) => {}} />
      </Field>
      <Separator />
      <Field label="Align">
        <TogglePill options={ALIGN_OPTIONS} value="" onChange={(_v: string) => {}} />
      </Field>
    </>
  );
}

export function OptionsBar({ tool, opts, setOpts }: Props) {
  const update = <K extends keyof EditorOpts>(k: K, v: EditorOpts[K]) =>
    setOpts({ ...opts, [k]: v });
  return (
    <div className={optionsBar}>
      {(tool === 'brush' || tool === 'pencil' || tool === 'eraser') && (
        <PaintOptions tool={tool} opts={opts} update={update} />
      )}
      {tool === 'shape' && <ShapeOptions opts={opts} update={update} />}
      {tool === 'text' && <TextOptions />}
      {tool !== 'brush' &&
        tool !== 'pencil' &&
        tool !== 'eraser' &&
        tool !== 'shape' &&
        tool !== 'text' && <SelectionOptions />}
    </div>
  );
}
