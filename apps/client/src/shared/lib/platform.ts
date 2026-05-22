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
  return parts.map((p) => (p === 'Mod' ? (mac ? '⌘' : 'Ctrl') : p)).join(mac ? '' : '+');
};
