export const GOOGLE_TEXT_FONTS = [
  'Inter',
  'Roboto',
  'Open Sans',
  'Montserrat',
  'Lato',
  'Poppins',
  'Nunito',
  'Raleway',
  'Oswald',
  'Merriweather',
  'Playfair Display',
  'Source Code Pro',
] as const;

export const GOOGLE_TEXT_FONT_WEIGHTS = ['300', '400', '500', '600', '700', '800', '900'] as const;

export const DEFAULT_TEXT_FONT_FAMILY = GOOGLE_TEXT_FONTS[0];
export const DEFAULT_TEXT_FONT_WEIGHT = '400';

const LINK_ID = 'grafier-google-text-fonts';
const PRECONNECT_API_ID = 'grafier-google-fonts-preconnect';
const PRECONNECT_STATIC_ID = 'grafier-google-static-preconnect';

function encodeFamily(family: string) {
  return family.trim().split(/\s+/).join('+');
}

function buildUrl() {
  const families = GOOGLE_TEXT_FONTS.map((family) => {
    const encoded = encodeFamily(family);
    return `family=${encoded}:wght@${GOOGLE_TEXT_FONT_WEIGHTS.join(';')}`;
  }).join('&');
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}

function appendPreconnectLink(id: string, href: string, crossOrigin?: string) {
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'preconnect';
  link.href = href;
  if (crossOrigin) link.crossOrigin = crossOrigin;
  document.head.appendChild(link);
}

export function injectGoogleFontsLink() {
  if (typeof document === 'undefined') return;
  appendPreconnectLink(PRECONNECT_API_ID, 'https://fonts.googleapis.com');
  appendPreconnectLink(PRECONNECT_STATIC_ID, 'https://fonts.gstatic.com', 'anonymous');
  if (document.getElementById(LINK_ID)) return;
  const stylesheet = document.createElement('link');
  stylesheet.id = LINK_ID;
  stylesheet.rel = 'stylesheet';
  stylesheet.href = buildUrl();
  document.head.appendChild(stylesheet);
}
