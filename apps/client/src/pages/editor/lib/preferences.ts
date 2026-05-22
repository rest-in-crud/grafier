const SECTION_KEY_PREFIX = 'grafier.panel-sections.';
const RAIL_WIDTH_KEY = 'grafier.right-rail-width';

const DEFAULT_RAIL_WIDTH = 320;
const MIN_RAIL_WIDTH = 240;
const MAX_RAIL_WIDTH = 520;

export const clampRailWidth = (n: number): number =>
  Math.min(MAX_RAIL_WIDTH, Math.max(MIN_RAIL_WIDTH, n));

export const loadCollapsed = (id: string): boolean => {
  try {
    return localStorage.getItem(SECTION_KEY_PREFIX + id) === 'closed';
  } catch {
    return false;
  }
};

export const saveCollapsed = (id: string, collapsed: boolean): void => {
  try {
    localStorage.setItem(SECTION_KEY_PREFIX + id, collapsed ? 'closed' : 'open');
  } catch {
    // swallow
  }
};

export const loadRailWidth = (): number => {
  try {
    const raw = localStorage.getItem(RAIL_WIDTH_KEY);
    if (!raw) return DEFAULT_RAIL_WIDTH;
    const n = Number(raw);
    if (!Number.isFinite(n)) return DEFAULT_RAIL_WIDTH;
    return clampRailWidth(n);
  } catch {
    return DEFAULT_RAIL_WIDTH;
  }
};

export const saveRailWidth = (n: number): void => {
  try {
    localStorage.setItem(RAIL_WIDTH_KEY, String(clampRailWidth(n)));
  } catch {
    // swallow
  }
};

export { MIN_RAIL_WIDTH, MAX_RAIL_WIDTH, DEFAULT_RAIL_WIDTH };
