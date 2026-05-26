// apps/client/src/shared/lib/safe-redirect.ts

// VERIFY (manual smoke during PR review): each of these MUST return null
//   safeRedirect(null)                   -> null
//   safeRedirect('')                     -> null
//   safeRedirect('a'.repeat(513))        -> null
//   safeRedirect('//evil.com')           -> null
//   safeRedirect('/\\evil.com')          -> null (slash + backslash)
//   safeRedirect('\\evil.com')           -> null (no leading slash)
//   safeRedirect('https://evil.com')     -> null
//   safeRedirect('/%2Fevil.com')         -> null (percent-encoded slash)
//   safeRedirect('/%2fevil.com')         -> null (lowercase variant)
//   safeRedirect('/%5Cevil.com')         -> null (percent-encoded backslash)
//   safeRedirect('/\r/Set-Cookie')       -> null (CRLF)
//   safeRedirect('/\n/Set-Cookie')       -> null
//   safeRedirect('/\0/x')                -> null (null byte)
//   safeRedirect('  /p/abc')             -> '/p/abc' (leading spaces stripped)
//   safeRedirect('\t/p/abc')             -> '/p/abc' (leading tab stripped)
// these MUST round-trip
//   safeRedirect('/')                    -> '/'
//   safeRedirect('/p/abc')               -> '/p/abc'
//   safeRedirect('/editor/123?z=1')      -> '/editor/123?z=1'

const MAX = 512;

const safeRedirect = (raw: string | null | undefined): string | null => {
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

export { safeRedirect };
