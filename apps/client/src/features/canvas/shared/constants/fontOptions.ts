export const FONT_FAMILIES = [
  'Arial',
  'Georgia',
  'Courier New',
  'Times New Roman',
  'Verdana',
] as const;

export const FONT_WEIGHTS = ['normal', 'bold'] as const;

export type FontFamily = (typeof FONT_FAMILIES)[number];
export type FontWeight = (typeof FONT_WEIGHTS)[number];
