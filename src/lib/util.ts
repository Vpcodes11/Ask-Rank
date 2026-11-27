import { createHash, randomBytes } from 'node:crypto';

/** "https://www.Shop.com/products/x?y" -> "shop.com". Returns null for anything that is not a public hostname. */
export function normalizeDomain(raw: string): string | null {
  let s = String(raw || '').trim().toLowerCase();
  if (!s) return null;
  s = s.replace(/^[a-z]+:\/\//, '').replace(/[/?#].*$/, '').replace(/:\d+$/, '').replace(/^www\./, '');
  if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(s)) return null;
  if (s.length > 253) return null;
  // Block local / private targets (the scanner fetches this host server-side).
  if (/^(localhost|.*\.local|.*\.internal|.*\.localhost)$/.test(s)) return null;
  if (/^\d+\.\d+\.\d+\.\d+$/.test(s)) return null;
  return s;
}

export const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');

export const randomToken = (bytes = 32) => randomBytes(bytes).toString('base64url');

export const shortId = (len = 6) => randomBytes(len).toString('base64url').replace(/[^a-z0-9]/gi, '').toLowerCase().slice(0, len);

export function appUrl(): string {
  return (process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');
}

export function isEmail(s: unknown): s is string {
  return typeof s === 'string' && s.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}

/** Runs async tasks with at most `limit` in flight; results keep input order. */
export async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T, index: number) => Promise<R>): Promise<R[]> {
  const out = new Array<R>(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) {
      const i = next++;
      if (i >= items.length) return;
      out[i] = await fn(items[i], i);
    }
  });
  await Promise.all(workers);
  return out;
}

export function clientIp(headers: Headers): string {
  return (headers.get('x-forwarded-for') || '').split(',')[0].trim() || headers.get('x-real-ip') || 'unknown';
}

export function intEnv(name: string, fallback: number): number {
  const v = Number(process.env[name]);
  return Number.isFinite(v) && v > 0 ? Math.floor(v) : fallback;
}
