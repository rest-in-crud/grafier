import type { Canvas } from 'fabric';
import { FabricImage } from 'fabric';
import { blobToDataUrl } from '@/shared/lib/blob';

const ALLOWED_TYPES: ReadonlyArray<string> = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];

const MAX_BYTES = 2 * 1024 * 1024;
const MAX_PAYLOAD_BYTES = 9.5 * 1024 * 1024;
const BASE64_INFLATION = 4 / 3;
const NEW_OBJECT_OVERHEAD = 500;
const FIT_RATIO = 0.95;

type InsertImageReason = 'unsupported-format' | 'too-large' | 'canvas-too-large' | 'decode-failed';

type InsertImageResult = { ok: true } | { ok: false; reason: InsertImageReason };

const projectedJsonSize = (canvas: Canvas, blob: Blob): number => {
  const current = JSON.stringify(canvas.toJSON()).length;
  const image = Math.ceil(blob.size * BASE64_INFLATION) + NEW_OBJECT_OVERHEAD;
  return current + image;
};

const insertImageFromBlob = async (canvas: Canvas, blob: Blob): Promise<InsertImageResult> => {
  if (!ALLOWED_TYPES.includes(blob.type)) {
    return { ok: false, reason: 'unsupported-format' };
  }
  if (blob.size > MAX_BYTES) {
    return { ok: false, reason: 'too-large' };
  }
  if (projectedJsonSize(canvas, blob) > MAX_PAYLOAD_BYTES) {
    return { ok: false, reason: 'canvas-too-large' };
  }

  let dataUrl: string;
  try {
    dataUrl = await blobToDataUrl(blob);
  } catch {
    return { ok: false, reason: 'decode-failed' };
  }

  let img: FabricImage;
  try {
    img = await FabricImage.fromURL(dataUrl);
  } catch {
    return { ok: false, reason: 'decode-failed' };
  }

  const canvasW = canvas.width ?? 0;
  const canvasH = canvas.height ?? 0;
  const imgW = img.width ?? 0;
  const imgH = img.height ?? 0;

  if (canvasW <= 0 || canvasH <= 0 || imgW <= 0 || imgH <= 0) {
    return { ok: false, reason: 'decode-failed' };
  }

  const scale = Math.min((canvasW * FIT_RATIO) / imgW, (canvasH * FIT_RATIO) / imgH, 1);

  img.scale(scale);
  img.set({
    originX: 'center',
    originY: 'center',
    left: canvasW / 2,
    top: canvasH / 2,
  });

  canvas.add(img);
  canvas.setActiveObject(img);
  canvas.requestRenderAll();

  return { ok: true };
};

const noticeForInsertImageReason = (reason: InsertImageReason): string => {
  switch (reason) {
    case 'unsupported-format':
      return '✕  UNSUPPORTED FORMAT';
    case 'too-large':
      return '✕  IMAGE TOO LARGE (MAX 2 MB)';
    case 'canvas-too-large':
      return '✕  DESIGN WOULD EXCEED 10 MB SAVE LIMIT';
    case 'decode-failed':
      return '✕  COULD NOT DECODE IMAGE';
  }
};

export { insertImageFromBlob, noticeForInsertImageReason };
export type { InsertImageResult, InsertImageReason };
