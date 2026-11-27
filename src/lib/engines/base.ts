import { EngineId, EngineSource } from '../types';

/** What a search-grounded AI engine answered for one buyer prompt. */
export interface EngineAnswer {
  text: string;
  sources: EngineSource[];
}

export interface AIEngine {
  id: EngineId;
  name: string;
  isConfigured(): boolean;
  /** Sends the buyer prompt exactly as a shopper would type it. Throws on API errors. */
  ask(prompt: string, opts?: { country?: string }): Promise<EngineAnswer>;
}

export const ENGINE_TIMEOUT_MS = 60_000;

export function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return '';
  }
}

export function toSource(url: string, title?: string): EngineSource | null {
  const domain = domainOf(url);
  if (!domain) return null;
  return { url, title: (title || domain).slice(0, 200), domain };
}

/** Removes duplicate URLs, keeps order, caps the list. */
export function dedupeSources(list: Array<EngineSource | null>, max = 10): EngineSource[] {
  const seen = new Set<string>();
  const out: EngineSource[] = [];
  for (const s of list) {
    if (!s || seen.has(s.url)) continue;
    seen.add(s.url);
    out.push(s);
    if (out.length >= max) break;
  }
  return out;
}

export async function failText(res: Response): Promise<string> {
  return `${res.status} ${(await res.text().catch(() => '')).slice(0, 300)}`;
}
