import type { Canvas } from 'fabric';

type ExportFormat = 'png' | 'jpg' | 'svg' | 'pdf';

class ExportError extends Error {
  public readonly format: ExportFormat;
  public readonly cause: unknown;

  constructor(format: ExportFormat, cause: unknown) {
    super(`Export to ${format} failed`);
    this.name = 'ExportError';
    this.format = format;
    this.cause = cause;
  }
}

const INVALID_FILENAME_CHARS = /[/\\:*?"<>|]/g;
const MAX_FILENAME_LENGTH = 100;

const buildFilename = (projectName: string, format: ExportFormat): string => {
  const sanitized = projectName
    .replace(INVALID_FILENAME_CHARS, '_')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_FILENAME_LENGTH);
  const base = sanitized.length > 0 ? sanitized : 'design';
  return `${base}.${format}`;
};

const triggerDownload = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 0);
};

const isTransparentBg = (bg: unknown): boolean => {
  if (bg === undefined || bg === null) return true;
  if (typeof bg !== 'string') return false;
  const trimmed = bg.trim().toLowerCase();
  if (trimmed === '' || trimmed === 'transparent') return true;
  const rgbaMatch = trimmed.match(/^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*([\d.]+)\s*\)$/);
  if (rgbaMatch) {
    const alpha = Number(rgbaMatch[1]);
    return Number.isFinite(alpha) && alpha < 1;
  }
  return false;
};

const restoreBg = (canvas: Canvas, value: unknown): void => {
  if (value === undefined || value === null) {
    canvas.set('backgroundColor', '');
  } else if (typeof value === 'string') {
    canvas.set('backgroundColor', value);
  } else {
    canvas.set('backgroundColor', '');
  }
};

const withWhiteBgIfTransparent = async <T>(
  canvas: Canvas,
  fn: () => Promise<T> | T,
): Promise<T> => {
  const original: unknown = canvas.backgroundColor;
  if (!isTransparentBg(original)) {
    return await fn();
  }
  canvas.set('backgroundColor', '#ffffff');
  canvas.renderAll();
  try {
    return await fn();
  } finally {
    restoreBg(canvas, original);
    canvas.renderAll();
  }
};

const blobToDataUrl = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        reject(new Error('FileReader returned non-string for blob'));
        return;
      }
      resolve(result);
    };
    reader.onerror = () => reject(reader.error ?? new Error('FileReader failed'));
    reader.readAsDataURL(blob);
  });

const toPng = async (canvas: Canvas): Promise<Blob> => {
  const blob = await canvas.toBlob({ format: 'png', multiplier: 1 });
  if (!blob) throw new Error('Canvas toBlob returned null for png');
  return blob;
};

const toJpg = async (canvas: Canvas): Promise<Blob> => {
  return withWhiteBgIfTransparent(canvas, async () => {
    const blob = await canvas.toBlob({ format: 'jpeg', quality: 0.92, multiplier: 1 });
    if (!blob) throw new Error('Canvas toBlob returned null for jpeg');
    return blob;
  });
};

const toSvg = (canvas: Canvas): Blob => {
  const svg = canvas.toSVG();
  return new Blob([svg], { type: 'image/svg+xml' });
};

const toPdf = async (canvas: Canvas): Promise<Blob> => {
  return withWhiteBgIfTransparent(canvas, async () => {
    const width = canvas.width ?? 0;
    const height = canvas.height ?? 0;
    if (width <= 0 || height <= 0) {
      throw new Error('Canvas has no dimensions for pdf export');
    }
    const pngBlob = await canvas.toBlob({ format: 'png', multiplier: 1 });
    if (!pngBlob) throw new Error('Canvas toBlob returned null for pdf source');
    const dataUrl = await blobToDataUrl(pngBlob);
    const { jsPDF } = await import('jspdf');
    const pdf = new jsPDF({
      orientation: width >= height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [width, height],
    });
    pdf.addImage(dataUrl, 'PNG', 0, 0, width, height);
    return pdf.output('blob');
  });
};

const dispatch = async (canvas: Canvas, format: ExportFormat): Promise<Blob> => {
  switch (format) {
    case 'png':
      return await toPng(canvas);
    case 'jpg':
      return await toJpg(canvas);
    case 'svg':
      return toSvg(canvas);
    case 'pdf':
      return await toPdf(canvas);
  }
};

const exportAs = async (
  canvas: Canvas,
  format: ExportFormat,
  projectName: string,
): Promise<void> => {
  try {
    const blob = await dispatch(canvas, format);
    triggerDownload(blob, buildFilename(projectName, format));
  } catch (cause) {
    if (cause instanceof ExportError) throw cause;
    throw new ExportError(format, cause);
  }
};

export { exportAs, ExportError };
export type { ExportFormat };
