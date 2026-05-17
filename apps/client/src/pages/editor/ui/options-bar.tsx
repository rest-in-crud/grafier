import type { CSSProperties, ReactNode } from 'react';
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

function assertNever(value: never): never {
  throw new Error(`Unhandled control kind: ${JSON.stringify(value)}`);
}

type LeafControl =
  | {
      kind: 'slider';
      value: number;
      onChange: (v: number) => void;
      min?: number;
      max?: number;
      step?: number;
      suffix?: string;
      compact?: boolean;
    }
  | {
      kind: 'select';
      options: readonly string[];
      value?: string;
      defaultValue?: string;
      onChange?: (v: string) => void;
    }
  | { kind: 'pill'; options: ToggleOption<string>[]; value: string; onChange: (v: string) => void }
  | { kind: 'swatch'; color?: string; style?: CSSProperties };

type Control =
  | { kind: 'label'; text: string }
  | { kind: 'sep' }
  | { kind: 'field'; label: string; controls: LeafControl[] }
  | LeafControl;

function renderControl(c: Control, key: string | number): ReactNode {
  switch (c.kind) {
    case 'label':
      return <Label key={key}>{c.text}</Label>;
    case 'sep':
      return <Separator key={key} />;
    case 'field':
      return (
        <Field key={key} label={c.label}>
          {c.controls.map((child, i) => renderControl(child, i))}
        </Field>
      );
    case 'slider':
      return (
        <Slider
          key={key}
          value={c.value}
          onChange={c.onChange}
          min={c.min}
          max={c.max}
          step={c.step}
          suffix={c.suffix}
          compact={c.compact}
        />
      );
    case 'select':
      return (
        <Select
          key={key}
          options={c.options}
          value={c.value}
          defaultValue={c.defaultValue}
          onChange={c.onChange}
        />
      );
    case 'pill':
      return <TogglePill key={key} options={c.options} value={c.value} onChange={c.onChange} />;
    case 'swatch':
      return <Swatch key={key} color={c.color} style={c.style} />;
    default:
      return assertNever(c);
  }
}

const BLEND_OPTIONS = ['NORMAL', 'MULTIPLY', 'SCREEN', 'OVERLAY'] as const;
const FONT_OPTIONS = ['INTER', 'JETBRAINS MONO', 'SERIF'] as const;

function buildControls(
  tool: ToolId,
  opts: EditorOpts,
  update: <K extends keyof EditorOpts>(k: K, v: EditorOpts[K]) => void,
): Control[] {
  if (tool === 'brush' || tool === 'pencil' || tool === 'eraser') {
    const toolLabel = tool === 'brush' ? 'Brush' : tool === 'pencil' ? 'Pencil' : 'Eraser';
    return [
      { kind: 'label', text: toolLabel },
      { kind: 'sep' },
      {
        kind: 'field',
        label: 'Size',
        controls: [
          {
            kind: 'slider',
            value: opts.size,
            onChange: (v) => update('size', v),
            min: 1,
            max: 200,
            suffix: ' PX',
          },
        ],
      },
      { kind: 'sep' },
      {
        kind: 'field',
        label: 'Opacity',
        controls: [
          {
            kind: 'slider',
            value: opts.opacity,
            onChange: (v) => update('opacity', v),
            suffix: '%',
          },
        ],
      },
      { kind: 'sep' },
      {
        kind: 'field',
        label: 'Hardness',
        controls: [
          {
            kind: 'slider',
            value: opts.hardness,
            onChange: (v) => update('hardness', v),
            suffix: '%',
            compact: true,
          },
        ],
      },
      { kind: 'sep' },
      {
        kind: 'field',
        label: 'Blend',
        controls: [
          {
            kind: 'select',
            options: BLEND_OPTIONS,
            value: opts.blend,
            onChange: (v) => update('blend', v as BlendMode),
          },
        ],
      },
    ];
  }

  if (tool === 'shape') {
    return [
      { kind: 'label', text: 'Shape' },
      { kind: 'sep' },
      {
        kind: 'pill',
        options: [
          { value: 'RECT', label: 'RECT' },
          { value: 'ELLIPSE', label: 'ELLIPSE' },
          { value: 'POLY', label: 'POLY' },
          { value: 'LINE', label: 'LINE' },
        ],
        value: 'RECT',
        onChange: (_v: string) => {},
      },
      { kind: 'sep' },
      {
        kind: 'field',
        label: 'Fill',
        controls: [{ kind: 'swatch', color: '#e8e8e8' }],
      },
      {
        kind: 'field',
        label: 'Stroke',
        controls: [
          { kind: 'swatch', color: '#000', style: { borderColor: 'var(--fg)' } },
          {
            kind: 'slider',
            value: opts.stroke,
            onChange: (v) => update('stroke', v),
            min: 0,
            max: 20,
            suffix: ' PX',
            compact: true,
          },
        ],
      },
    ];
  }

  if (tool === 'text') {
    return [
      { kind: 'label', text: 'Type' },
      { kind: 'sep' },
      { kind: 'select', options: FONT_OPTIONS, defaultValue: 'INTER' },
      {
        kind: 'field',
        label: 'Size',
        controls: [
          {
            kind: 'slider',
            value: 48,
            onChange: (_v: number) => {},
            min: 6,
            max: 400,
            suffix: ' PT',
            compact: true,
          },
        ],
      },
      {
        kind: 'pill',
        options: [
          { value: 'B', label: 'B', style: { fontWeight: 700 } },
          { value: 'I', label: 'I', style: { fontStyle: 'italic' } },
          { value: 'U', label: 'U', style: { textDecoration: 'underline' } },
        ],
        value: 'B',
        onChange: (_v: string) => {},
      },
      {
        kind: 'pill',
        options: [
          { value: 'L', label: 'L' },
          { value: 'C', label: 'C' },
          { value: 'R', label: 'R' },
          { value: 'J', label: 'J' },
        ],
        value: 'L',
        onChange: (_v: string) => {},
      },
    ];
  }

  return [
    { kind: 'label', text: 'Selection' },
    { kind: 'sep' },
    {
      kind: 'field',
      label: 'Auto-Select',
      controls: [
        {
          kind: 'pill',
          options: [
            { value: 'LAYER', label: 'LAYER' },
            { value: 'GROUP', label: 'GROUP' },
          ],
          value: 'LAYER',
          onChange: (_v: string) => {},
        },
      ],
    },
    { kind: 'sep' },
    {
      kind: 'field',
      label: 'Show Bounds',
      controls: [
        {
          kind: 'pill',
          options: [
            { value: 'ON', label: 'ON' },
            { value: 'OFF', label: 'OFF' },
          ],
          value: 'ON',
          onChange: (_v: string) => {},
        },
      ],
    },
    { kind: 'sep' },
    {
      kind: 'field',
      label: 'Align',
      controls: [
        {
          kind: 'pill',
          options: [
            { value: 'L', label: 'L' },
            { value: 'C', label: 'C' },
            { value: 'R', label: 'R' },
            { value: 'T', label: 'T' },
            { value: 'M', label: 'M' },
            { value: 'B', label: 'B' },
          ],
          value: '',
          onChange: (_v: string) => {},
        },
      ],
    },
  ];
}

export function OptionsBar({ tool, opts, setOpts }: Props) {
  const update = <K extends keyof EditorOpts>(k: K, v: EditorOpts[K]) =>
    setOpts({ ...opts, [k]: v });

  return (
    <div className={optionsBar}>
      {buildControls(tool, opts, update).map((c, i) => renderControl(c, i))}
    </div>
  );
}
