import type { ToolStyles } from '@/features/canvas/store/canvas.store';

const STORAGE_KEY = 'grafier.tool-styles';

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const narrowPencil = (raw: unknown): ToolStyles['pencil'] => {
  if (!isPlainObject(raw)) return undefined;
  const out: NonNullable<ToolStyles['pencil']> = {};
  if (typeof raw.width === 'number') out.width = raw.width;
  if (typeof raw.opacity === 'number') out.opacity = raw.opacity;
  if (typeof raw.color === 'string') out.color = raw.color;
  return out;
};

const narrowEraser = (raw: unknown): ToolStyles['eraser'] => {
  if (!isPlainObject(raw)) return undefined;
  const out: NonNullable<ToolStyles['eraser']> = {};
  if (typeof raw.size === 'number') out.size = raw.size;
  return out;
};

const narrowText = (raw: unknown): ToolStyles['text'] => {
  if (!isPlainObject(raw)) return undefined;
  const out: NonNullable<ToolStyles['text']> = {};
  if (typeof raw.fontSize === 'number') out.fontSize = raw.fontSize;
  if (typeof raw.fontFamily === 'string') out.fontFamily = raw.fontFamily;
  if (typeof raw.fontWeight === 'string') out.fontWeight = raw.fontWeight;
  if (typeof raw.fill === 'string') out.fill = raw.fill;
  return out;
};

const narrowShape = (raw: unknown): ToolStyles['shape'] => {
  if (!isPlainObject(raw)) return undefined;
  const out: NonNullable<ToolStyles['shape']> = {};
  if (typeof raw.strokeWidth === 'number') out.strokeWidth = raw.strokeWidth;
  if (typeof raw.fill === 'string') out.fill = raw.fill;
  if (typeof raw.stroke === 'string') out.stroke = raw.stroke;
  if (typeof raw.opacity === 'number') out.opacity = raw.opacity;
  return out;
};

export const loadToolStyles = (): ToolStyles => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!isPlainObject(parsed)) return {};
    const out: ToolStyles = {};
    const pencil = narrowPencil(parsed.pencil);
    const eraser = narrowEraser(parsed.eraser);
    const text = narrowText(parsed.text);
    const shape = narrowShape(parsed.shape);
    if (pencil) out.pencil = pencil;
    if (eraser) out.eraser = eraser;
    if (text) out.text = text;
    if (shape) out.shape = shape;
    return out;
  } catch {
    return {};
  }
};

export const saveToolStyles = (styles: ToolStyles): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(styles));
  } catch {
    // swallow: private browsing, quota exceeded, etc.
  }
};
