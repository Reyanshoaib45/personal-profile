/** Small helpers shared by the serverless routes. */

export const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });

export const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

/** Trims, strips CRLF (header-injection guard) and length-caps untrusted input. */
export const clean = (value: unknown, max = 3000) =>
  typeof value === 'string' ? value.replace(/\r\n/g, '\n').trim().slice(0, max) : '';

export function clientIp(request: Request, clientAddress?: string): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    clientAddress ||
    'unknown'
  );
}

/**
 * Best-effort, per-warm-instance rate limit. Vercel may cold-start between hits, so
 * this stops casual abuse and accidental double-submits, not a determined attacker.
 */
export function createRateLimiter(windowMs: number, max: number) {
  const hits = new Map<string, number[]>();

  return (ip: string): boolean => {
    const now = Date.now();
    const recent = (hits.get(ip) ?? []).filter((t) => now - t < windowMs);
    recent.push(now);
    hits.set(ip, recent);

    if (hits.size > 500) {
      for (const [key, times] of hits) {
        if (!times.some((t) => now - t < windowMs)) hits.delete(key);
      }
    }

    return recent.length > max;
  };
}
