export const config = { runtime: 'edge' };

const FALLBACK_TITLE = 'Shared design • Grafier';
const FALLBACK_DESCRIPTION = 'View a design shared on Grafier';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const escapeHtml = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const token = url.searchParams.get('token') ?? '';
  const origin = url.origin;
  const backend = process.env.BACKEND_URL ?? '';

  let title = FALLBACK_TITLE;
  let description = FALLBACK_DESCRIPTION;

  if (token && backend && UUID_RE.test(token)) {
    try {
      const res = await fetch(`${backend}/shared/designs/${token}`, {
        headers: { accept: 'application/json' },
        signal: AbortSignal.timeout(2500),
      });
      if (res.ok) {
        const data = (await res.json()) as { name?: string; userName?: string };
        if (typeof data.name === 'string') title = data.name;
        if (typeof data.userName === 'string') {
          description = `Shared by @${data.userName} on Grafier`;
        }
      }
    } catch {
      // fall through to fallback copy (timeout, network error, non-OK status)
    }
  }

  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);
  const safeUrl = escapeHtml(`${origin}/p/${token}`);
  const imageUrl = `${origin}/og/share-card.png`;

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${safeTitle}</title>
    <meta property="og:title" content="${safeTitle}" />
    <meta property="og:description" content="${safeDescription}" />
    <meta property="og:image" content="${imageUrl}" />
    <meta property="og:url" content="${safeUrl}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Grafier" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${safeTitle}" />
    <meta name="twitter:description" content="${safeDescription}" />
    <meta name="twitter:image" content="${imageUrl}" />
  </head>
  <body><a href="${safeUrl}">Open in Grafier</a></body>
</html>`;

  return new Response(html, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=300, s-maxage=300',
    },
  });
}
