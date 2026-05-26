const AUTO_LABEL_PREFIX = 'Auto-saved ';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const formatVersionName = (date: Date): string => {
  const month = MONTHS[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  const minuteStr = String(minute).padStart(2, '0');
  return `${month} ${day}, ${year} · ${hour12}:${minuteStr} ${period}`;
};

const formatVersionTimestamp = (iso: string): string => formatVersionName(new Date(iso));

const buildAutoLabel = (date: Date): string => `${AUTO_LABEL_PREFIX}${formatVersionName(date)}`;

const buildAutoBeforeRestoreLabel = (date: Date): string =>
  `${AUTO_LABEL_PREFIX}before restore (${formatVersionName(date)})`;

const isAutoLabel = (label: string | null): boolean =>
  label !== null && label.startsWith(AUTO_LABEL_PREFIX);

export {
  AUTO_LABEL_PREFIX,
  formatVersionName,
  formatVersionTimestamp,
  buildAutoLabel,
  buildAutoBeforeRestoreLabel,
  isAutoLabel,
};
