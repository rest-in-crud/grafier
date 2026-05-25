import { useRef, useState } from 'react';
import { useCanvasStore } from '@/features/canvas/store/canvas.store';
import { loadTextFont } from '@/features/canvas/lib/tools/TextTool/fontLoader';
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
import {
  useCustomFontStore,
  saveCustomFont,
  MAX_FONT_FILE_SIZE,
} from '@/features/canvas/lib/tools/TextTool/customFontStorage';
import { BRUSH_DEFAULT_STYLES } from '@/features/canvas/lib/tools/BrushTool/BrushTool.styles';
import { TEXT_DEFAULT_STYLES } from '@/features/canvas/lib/tools/TextTool/TextTool';
import { ERASER_DEFAULT_STYLES } from '@/features/canvas/lib/tools/EraserTool/EraserTool';
import type { ToolId } from '../types';
import { IUpload } from '../icons';
import {
  ColorField,
  Field,
  IconButton,
  Label,
  Select,
  Separator,
  Slider,
  TogglePill,
} from './primitives';
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

function BrushOptions() {
  const styles = useCanvasStore((s) => s.toolStyles.brush);
  const setToolStyle = useCanvasStore((s) => s.setToolStyle);

  const color = styles?.color ?? BRUSH_DEFAULT_STYLES.color;
  const width = styles?.width ?? BRUSH_DEFAULT_STYLES.width;
  const opacity = styles?.opacity ?? BRUSH_DEFAULT_STYLES.opacity;
  const smoothing = styles?.smoothing ?? BRUSH_DEFAULT_STYLES.smoothing;

  return (
    <>
      <Label>Brush</Label>
      <Separator />
      <Field label="Color">
        <ColorField value={color} onCommit={(v) => setToolStyle('brush', { color: v })} />
      </Field>
      <Separator />
      <Field label="Size">
        <Slider
          value={width}
          onChange={(v) => setToolStyle('brush', { width: v })}
          min={1}
          max={200}
          suffix=" PX"
        />
      </Field>
      <Separator />
      <Field label="Opacity">
        <Slider
          value={opacity}
          onChange={(v) => setToolStyle('brush', { opacity: v })}
          suffix="%"
        />
      </Field>
      <Separator />
      <Field label="Smooth">
        <Slider
          value={smoothing}
          onChange={(v) => setToolStyle('brush', { smoothing: v })}
          min={0}
          max={5}
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

const FONT_WEIGHT_OPTIONS: string[] = [...GOOGLE_TEXT_FONT_WEIGHTS];
const GOOGLE_FONTS_LIST: string[] = [...GOOGLE_TEXT_FONTS];

function TextOptions() {
  const styles = useCanvasStore((s) => s.toolStyles.text);
  const setToolStyle = useCanvasStore((s) => s.setToolStyle);
  const applyToSelection = useCanvasStore((s) => s.applyToSelection);
  const selection = useCanvasStore((s) => s.selection);
  const customFamilies = useCustomFontStore((s) => s.families);

  const selectedText = selection.primary?.type === 'i-text' ? selection.primary : null;

  const fontFamily = selectedText?.fontFamily ?? styles?.fontFamily ?? DEFAULT_TEXT_FONT_FAMILY;
  const fontWeight = selectedText?.fontWeight ?? styles?.fontWeight ?? DEFAULT_TEXT_FONT_WEIGHT;
  const fontSize = selectedText?.fontSize ?? styles?.fontSize ?? TEXT_DEFAULT_STYLES.fontSize;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fontGroups =
    customFamilies.length > 0
      ? [
          { group: 'Custom', items: customFamilies as string[] },
          { group: 'Google Fonts', items: GOOGLE_FONTS_LIST },
        ]
      : undefined;

  async function applyFontFamily(family: string) {
    await loadTextFont(family, fontWeight);
    if (selectedText) applyToSelection({ fontFamily: family });
    setToolStyle('text', { fontFamily: family });
  }

  async function applyFontWeight(weight: string) {
    await loadTextFont(fontFamily, weight);
    if (selectedText) applyToSelection({ fontWeight: weight });
    setToolStyle('text', { fontWeight: weight });
  }

  function applyFontSize(size: number) {
    if (selectedText) applyToSelection({ fontSize: size });
    setToolStyle('text', { fontSize: size });
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'ttf' && ext !== 'otf') {
      setUploadError('Only TTF / OTF');
      return;
    }
    if (file.size > MAX_FONT_FILE_SIZE) {
      setUploadError('Max 5 MB');
      return;
    }

    setUploadError(null);
    try {
      const stored = await saveCustomFont(file);
      await applyFontFamily(stored.family);
    } catch {
      setUploadError('Upload failed');
    }
  }

  return (
    <>
      <Label>Type</Label>
      <Separator />
      <Field label="Font">
        <div className="flex items-center gap-1">
          <Select
            groups={fontGroups}
            options={fontGroups ? undefined : GOOGLE_FONTS_LIST}
            value={fontFamily}
            onChange={(v) => void applyFontFamily(v)}
          />
          <IconButton
            title="Upload font (TTF / OTF, max 5 MB)"
            onClick={() => fileInputRef.current?.click()}
          >
            <IUpload />
          </IconButton>
          <input
            ref={fileInputRef}
            type="file"
            accept=".ttf,.otf"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </Field>
      {uploadError && <span className="font-mono text-[10px] text-destructive">{uploadError}</span>}
      <Field label="Weight">
        <Select
          options={FONT_WEIGHT_OPTIONS}
          value={fontWeight}
          onChange={(v) => void applyFontWeight(v)}
        />
      </Field>
      <Field label="Size">
        <Slider value={fontSize} onChange={applyFontSize} min={6} max={400} suffix=" PT" compact />
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
            <span className="font-mono text-[10px] text-fg-dim">
              {eyedropperColor.toUpperCase()}
            </span>
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
  const selection = useCanvasStore((s) => s.selection);
  const isTextSelected = selection.primary?.type === 'i-text';

  return (
    <div className={optionsBar}>
      {tool === 'pencil' ? (
        <PencilOptions />
      ) : tool === 'brush' ? (
        <BrushOptions />
      ) : tool === 'eraser' ? (
        <EraserOptions />
      ) : tool === 'shape' ? (
        <ShapeOptions />
      ) : tool === 'text' || (tool === 'move' && isTextSelected) ? (
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
