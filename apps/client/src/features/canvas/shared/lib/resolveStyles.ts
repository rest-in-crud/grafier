export function resolveStyles<T extends object>(styles: Record<string, unknown>, defaults: T): T {
  const patch: Record<string, unknown> = {};
  for (const [key, def] of Object.entries(defaults)) {
    const val = styles[key];
    if (val !== undefined && typeof val === typeof def) {
      patch[key] = val;
    }
  }
  return Object.assign({}, defaults, patch);
}
