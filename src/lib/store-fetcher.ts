import type { StoreProduct, StoreSnapshot } from './types';

const UA = 'Mozilla/5.0 (compatible; AskRankBot/1.0; +https://askrank.ai/bot)';
const BROWSER_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';

export class StoreFetchError extends Error {}

async function get(url: string, opts: { accept?: string; timeout?: number; browser?: boolean } = {}) {
  return fetch(url, {
    headers: { 'User-Agent': opts.browser ? BROWSER_UA : UA, Accept: opts.accept || '*/*' },
    redirect: 'follow',
    signal: AbortSignal.timeout(opts.timeout ?? 10_000),
  });
}

/** Reads a store's public data. Never invents products: if none are public, the list is empty. */
export async function fetchStoreSnapshot(domain: string): Promise<StoreSnapshot> {
  const base = `https://${domain}`;

  let html = '';
  try {
    const res = await get(base, { accept: 'text/html', browser: true, timeout: 12_000 });
    if (res.ok) html = (await res.text()).slice(0, 2_000_000);
  } catch {
    /* handled below */
  }

  const [productsRes, sitemapRes, llmsRes] = await Promise.allSettled([
    get(`${base}/products.json?limit=30`, { accept: 'application/json' }),
    get(`${base}/sitemap.xml`, { accept: 'application/xml' }),
    get(`${base}/llms.txt`, { accept: 'text/plain' }),
  ]);

  const products: StoreProduct[] = [];
  let productsJsonFound = false;
  if (productsRes.status === 'fulfilled' && productsRes.value.ok) {
    try {
      const data = await productsRes.value.json();
      if (Array.isArray(data?.products)) {
        productsJsonFound = true;
        for (const p of data.products.slice(0, 30)) {
          if (!p?.title || !p?.handle) continue;
          products.push({
            title: String(p.title).slice(0, 200),
            handle: String(p.handle),
            description: htmlToText(String(p.body_html || '')).slice(0, 4000),
            price: String(p.variants?.[0]?.price ?? ''),
            url: `${base}/products/${p.handle}`,
            imageUrl: p.images?.[0]?.src,
            tags: Array.isArray(p.tags) ? p.tags.map(String) : typeof p.tags === 'string' ? p.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
          });
        }
      }
    } catch {
      /* not JSON */
    }
  }

  if (!html && !productsJsonFound) {
    throw new StoreFetchError(`We could not open ${domain}. Check the address, or the store may be blocking automated visits.`);
  }

  const sitemapFound = sitemapRes.status === 'fulfilled' && sitemapRes.value.ok;
  let llmsTxtFound = false;
  if (llmsRes.status === 'fulfilled' && llmsRes.value.ok) {
    const ct = llmsRes.value.headers.get('content-type') || '';
    llmsTxtFound = ct.includes('text/plain') || ct.includes('markdown');
  }

  const title = decode(match(html, /<title[^>]*>([^<]{1,300})<\/title>/i) || '');
  const ogSite = decode(metaContent(html, 'og:site_name') || '');
  const description = decode(metaContent(html, 'description') || metaContent(html, 'og:description') || '');
  const storeName = pickStoreName(ogSite, title, domain);

  return {
    domain,
    storeName,
    homepageTitle: title,
    homepageDescription: description.slice(0, 500),
    isShopify: productsJsonFound || /cdn\.shopify\.com|Shopify\.theme|myshopify\.com/.test(html),
    productsJsonFound,
    sitemapFound,
    llmsTxtFound,
    products,
    homepageJsonLdTypes: jsonLdTypes(html),
    currency: detectCurrency(html, domain),
  };
}

export function pickStoreName(ogSite: string, title: string, domain: string): string {
  if (ogSite && ogSite.length <= 60) return ogSite.trim();
  const fromTitle = title.split(/\s[|–—-]\s|\s·\s/).map((s) => s.trim()).filter(Boolean);
  const root = domain.split('.')[0].replace(/-/g, '');
  // Prefer the title segment that looks like the domain ("Home – Acme" on acme.com -> "Acme")
  const hit = fromTitle.find((s) => s.toLowerCase().replace(/[^a-z0-9]/g, '').includes(root) && s.length <= 60);
  if (hit) return hit;
  return domain.split('.')[0].split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export function detectCurrency(html: string, domain: string): string {
  const m = html.match(/Shopify\.currency\s*=\s*\{[^}]*"active"\s*:\s*"([A-Z]{3})"/) || html.match(/og:price:currency["'][^>]*content=["']([A-Z]{3})/i) || html.match(/"priceCurrency"\s*:\s*"([A-Z]{3})"/);
  if (m) return m[1].toUpperCase();
  if (domain.endsWith('.in') || html.includes('₹')) return 'INR';
  if (domain.endsWith('.co.uk') || domain.endsWith('.uk')) return 'GBP';
  return 'USD';
}

export const COUNTRY_BY_CURRENCY: Record<string, string> = { INR: 'IN', USD: 'US', GBP: 'GB', EUR: 'DE', AUD: 'AU', CAD: 'CA', AED: 'AE', SGD: 'SG' };

export function jsonLdBlocks(html: string): any[] {
  const out: any[] = [];
  for (const m of html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const parsed = JSON.parse(m[1].trim());
      const items = Array.isArray(parsed) ? parsed : parsed?.['@graph'] ? parsed['@graph'] : [parsed];
      out.push(...items.filter(Boolean));
    } catch {
      /* invalid JSON-LD is itself a finding, counted as missing */
    }
  }
  return out;
}

export function typesOf(node: any): string[] {
  const t = node?.['@type'];
  return (Array.isArray(t) ? t : [t]).filter((x) => typeof x === 'string');
}

function jsonLdTypes(html: string): string[] {
  return [...new Set(jsonLdBlocks(html).flatMap(typesOf))];
}

function match(html: string, re: RegExp) {
  return html.match(re)?.[1]?.trim() || null;
}

function metaContent(html: string, name: string): string | null {
  const esc = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return (
    match(html, new RegExp(`<meta[^>]+(?:name|property)=["']${esc}["'][^>]*content=["']([^"']*)["']`, 'i')) ||
    match(html, new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*(?:name|property)=["']${esc}["']`, 'i'))
  );
}

export function htmlToText(html: string): string {
  return decode(html.replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ').replace(/<br\s*\/?>|<\/p>|<\/li>/gi, '\n').replace(/<[^>]+>/g, ' '))
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n+/g, '\n')
    .trim();
}

function decode(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .trim();
}

export { get as fetchPublic };
