const MAX = 512;

export const safeRedirect = (raw: string | null | undefined): string | null => {
    if (raw === null || raw === undefined) return null;
    if (typeof raw !== 'string') return null;
    if (raw.length === 0 || raw.length > MAX) return null;

    let s = raw;
    while (s.length > 0 && (s.charCodeAt(0) === 0x20 || s.charCodeAt(0) === 0x09)) {
        s = s.slice(1);
    }
    if (s.length === 0) return null;

    for (let i = 0; i < s.length; i++) {
        const c = s.charCodeAt(i);
        if (c <= 0x1f) return null;
    }

    if (s.charAt(0) !== '/') return null;
    if (s.startsWith('//')) return null;
    if (s.startsWith('/\\')) return null;

    const head = s.slice(0, 4).toLowerCase();
    if (head.includes(':')) return null;
    if (head.includes('\\')) return null;
    if (head.includes('%2f')) return null;
    if (head.includes('%5c')) return null;

    return s;
};
