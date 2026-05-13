import { GOOGLE_TEXT_FONTS, GOOGLE_TEXT_FONT_WEIGHTS } from './googleFonts';
import type { FieldSchema } from '@/features/canvas/lib/tools/BaseTool';

export type FontWeight = 'normal' | 'bold' | '300' | '400' | '500' | '600' | '700' | '800' | '900';

export interface TextStyles {
  fill: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: FontWeight;
  opacity: number;
}

export const TEXT_DEFAULT_STYLES: TextStyles = {
  fill: '#000000',
  fontSize: 20,
  fontFamily: GOOGLE_TEXT_FONTS[0],
  fontWeight: GOOGLE_TEXT_FONT_WEIGHTS[1] as FontWeight,
  opacity: 1,
};

export const TEXT_STYLE_SCHEMA: Record<string, FieldSchema> = {
  fill: { type: 'color', label: 'Color' },
  fontSize: { type: 'number', label: 'Size', min: 1, max: 200 },
  fontFamily: {
    type: 'select',
    label: 'Font',
    options: [...GOOGLE_TEXT_FONTS]
  },
  fontWeight: {
    type: 'select',
    label: 'Weight',
    options: [...GOOGLE_TEXT_FONT_WEIGHTS]
  },
};
