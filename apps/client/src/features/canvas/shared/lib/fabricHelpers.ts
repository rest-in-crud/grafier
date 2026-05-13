import { Shadow } from 'fabric';

export const hexToRgba = (hex: string, opacity: number): string => {
  if (!hex.startsWith('#') || hex.length !== 7) return hex;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
};

export const buildShadow = (s: {
  shadowBlur: number;
  shadowColor: string;
  shadowOffsetX: number;
  shadowOffsetY: number;
}): Shadow | null => {
  if (s.shadowBlur === 0 && s.shadowOffsetX === 0 && s.shadowOffsetY === 0) return null;
  return new Shadow({
    color: s.shadowColor,
    blur: s.shadowBlur,
    offsetX: s.shadowOffsetX,
    offsetY: s.shadowOffsetY,
  });
};
