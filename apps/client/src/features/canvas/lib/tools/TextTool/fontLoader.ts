import { injectGoogleFontsLink, GOOGLE_TEXT_FONTS, GOOGLE_TEXT_FONT_WEIGHTS } from './googleFonts.ts';

const FONT_LOAD_TIMEOUT_MS = 3000;
const FONT_LOAD_SIZE_PX = 20;

function waitForTimeout(timeoutMs: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, timeoutMs);
  });
}

function normalizeFontFamily(fontFamily: unknown) {
  return typeof fontFamily === 'string' && fontFamily.trim().length > 0
    ? fontFamily
    : GOOGLE_TEXT_FONTS[0];
}

function normalizeFontWeight(fontWeight: unknown) {
  if (typeof fontWeight === 'number') {
    return String(fontWeight);
  }

  return typeof fontWeight === 'string' && fontWeight.trim().length > 0
    ? fontWeight
    : GOOGLE_TEXT_FONT_WEIGHTS[0];
}

export async function loadTextFont(fontFamily: unknown, fontWeight: unknown) {
  injectGoogleFontsLink();

  if (typeof document === 'undefined' || !document.fonts) return;

  const family = normalizeFontFamily(fontFamily);
  const weight = normalizeFontWeight(fontWeight);
  const fontSpec = `${weight} ${FONT_LOAD_SIZE_PX}px "${family}"`;

  try {
    await Promise.race([document.fonts.load(fontSpec), waitForTimeout(FONT_LOAD_TIMEOUT_MS)]);
  } catch {
    // Preserve text creation if the font CDN or CSS Font Loading API fails.
  }
}
