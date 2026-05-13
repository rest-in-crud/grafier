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

const GOOGLE_FONTS_LINK_ID = 'grafier-google-text-fonts';
const GOOGLE_FONTS_PRECONNECT_ID = 'grafier-google-fonts-preconnect';
const GOOGLE_STATIC_PRECONNECT_ID = 'grafier-google-static-preconnect';

function encodeGoogleFontsFamily(family: string) {
  return family.trim().split(/\s+/).join('+');
}

function buildGoogleFontsUrl() {
  const families = GOOGLE_TEXT_FONTS.map((family) => {
    const encodedFamily = encodeGoogleFontsFamily(family);

    return `family=${encodedFamily}:wght@${GOOGLE_TEXT_FONT_WEIGHTS.join(';')}`;
  }).join('&');

  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}

function appendPreconnectLink(id: string, href: string, crossOrigin?: string) {
  if (document.getElementById(id)) return;

  const link = document.createElement('link');
  link.id = id;
  link.rel = 'preconnect';
  link.href = href;

  if (crossOrigin) {
    link.crossOrigin = crossOrigin;
  }

  document.head.appendChild(link);
}

export function injectGoogleFontsLink() {
  if (typeof document === 'undefined') return;

  appendPreconnectLink(GOOGLE_FONTS_PRECONNECT_ID, 'https://fonts.googleapis.com');
  appendPreconnectLink(GOOGLE_STATIC_PRECONNECT_ID, 'https://fonts.gstatic.com', 'anonymous');

  const existingLink = document.getElementById(GOOGLE_FONTS_LINK_ID);
  if (existingLink) return;

  const stylesheet = document.createElement('link');
  stylesheet.id = GOOGLE_FONTS_LINK_ID;
  stylesheet.rel = 'stylesheet';
  stylesheet.href = buildGoogleFontsUrl();

  document.head.appendChild(stylesheet);
}
