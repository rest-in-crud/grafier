import {
  DEFAULT_TEXT_FONT_FAMILY,
  DEFAULT_TEXT_FONT_WEIGHT,
  injectGoogleFontsLink,
} from './googleFonts';

const FONT_LOAD_TIMEOUT_MS = 3000;
const FONT_LOAD_SIZE_PX = 20;

function delay(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function normalizeFamily(family: unknown): string {
  return typeof family === 'string' && family.trim().length > 0 ? family : DEFAULT_TEXT_FONT_FAMILY;
}

function normalizeWeight(weight: unknown): string {
  if (typeof weight === 'number') return String(weight);
  return typeof weight === 'string' && weight.trim().length > 0 ? weight : DEFAULT_TEXT_FONT_WEIGHT;
}

export async function loadTextFont(family: unknown, weight: unknown) {
  injectGoogleFontsLink();
  if (typeof document === 'undefined' || !document.fonts) return;

  const f = normalizeFamily(family);
  const w = normalizeWeight(weight);
  const spec = `${w} ${FONT_LOAD_SIZE_PX}px "${f}"`;

  try {
    await Promise.race([document.fonts.load(spec), delay(FONT_LOAD_TIMEOUT_MS)]);
  } catch {
    // Preserve text creation if the font CDN or CSS Font Loading API fails
  }
}
