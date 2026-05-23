const MAC_PATTERN = /Mac|iPhone|iPad|iPod/;

interface UserAgentDataLike {
  platform?: string;
}

interface NavigatorWithUaData extends Navigator {
  userAgentData?: UserAgentDataLike;
}

export const isMac = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  const nav = navigator as NavigatorWithUaData;
  const platform = nav.userAgentData?.platform ?? nav.platform ?? '';
  return MAC_PATTERN.test(platform);
};

export const primaryModifierKey = (): 'meta' | 'ctrl' => (isMac() ? 'meta' : 'ctrl');

export const isPrimaryModifier = (e: KeyboardEvent | MouseEvent): boolean =>
  isMac() ? e.metaKey : e.ctrlKey || e.metaKey;

export const formatHotkey = (parts: string[]): string => {
  const mac = isMac();
  const map: Record<string, string> = mac
    ? { Mod: '⌘', Shift: '⇧', Alt: '⌥', Ctrl: '⌃' }
    : { Mod: 'Ctrl', Shift: 'Shift', Alt: 'Alt' };
  const order: Record<string, number> = mac
    ? { Ctrl: 0, Alt: 1, Shift: 2, Mod: 3 }
    : { Mod: 0, Alt: 1, Shift: 2 };
  const sorted = [...parts].sort((a, b) => (order[a] ?? 99) - (order[b] ?? 99));
  return sorted.map((p) => map[p] ?? p).join(mac ? '' : '+');
};
