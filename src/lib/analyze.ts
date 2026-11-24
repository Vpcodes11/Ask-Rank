import { generateJson, llmProvider } from './llm';
import type { EngineCompetitor, EngineId, EngineSource, StoreProduct } from './types';

/** Lowercase, punctuation to spaces, collapsed. */
export const norm = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();

export interface BrandIdentity {
  name: string;
  domain: string;
}

/** Words that would match far too much if a store were named after them. */
const TOO_GENERIC = new Set(['shop', 'store', 'the', 'official', 'online', 'home', 'my', 'co', 'inc', 'india', 'usa']);

/** Name variants we accept as "the brand was mentioned". */
export function brandTerms(b: BrandIdentity): { phrases: string[]; squashed: string[] } {
  const root = b.domain.split('.')[0];
  const nameNorm = norm(b.name);
  const phrases = new Set<string>();
  if (nameNorm && !TOO_GENERIC.has(nameNorm)) phrases.add(nameNorm);
  // "Acme Skincare" -> also "acme" when the first word is distinctive enough
  const first = nameNorm.split(' ')[0];
  if (first && first.length >= 5 && !TOO_GENERIC.has(first) && nameNorm.split(' ').length > 1) phrases.add(first);
  // "Blue Tokai Coffee Roasters" -> also "blue tokai"
  const nameWords = nameNorm.split(' ');
  if (nameWords.length >= 3 && nameWords.slice(0, 2).join('').length >= 6) phrases.add(nameWords.slice(0, 2).join(' '));
  phrases.add(norm(b.domain)); // "acme com"
  const squashed = new Set<string>();
  const rootSq = root.replace(/-/g, '');
  if (rootSq.length >= 4 && !TOO_GENERIC.has(rootSq)) squashed.add(rootSq);
  const nameSq = nameNorm.replace(/ /g, '');
  if (nameSq.length >= 4 && !TOO_GENERIC.has(nameSq)) squashed.add(nameSq);
  return { phrases: [...phrases].filter(Boolean), squashed: [...squashed] };
}

export function mentionsBrand(text: string, b: BrandIdentity): boolean {
  const t = ` ${norm(text)} `;
  const { phrases, squashed } = brandTerms(b);
  if (phrases.some((p) => t.includes(` ${p} `))) return true;
  // "Blue Tokai" in text vs domain "bluetokai.com" / "bluetokaicoffee.com": compare with spaces
  // removed, word-aligned. 2+ words that spell the start of the domain name also count.
  const words = t.trim().split(' ');
  for (const sq of squashed) {
    for (let i = 0; i < words.length; i++) {
      let acc = '';
      for (let j = i; j < Math.min(words.length, i + 4); j++) {
        acc += words[j];
        if (acc === sq) return true;
        if (j > i && acc.length >= 7 && sq.startsWith(acc) && !TOO_GENERIC.has(words[i])) return true;
        if (acc.length >= sq.length) break;
      }
    }
  }
  return false;
}

export function citesStore(sources: EngineSource[], domain: string): boolean {
  return sources.some((s) => s.domain === domain || s.domain.endsWith(`.${domain}`));
}

export function productsMentioned(text: string, products: StoreProduct[]): string[] {
  const t = ` ${norm(text)} `;
  return products
    .filter((p) => {
      const n = norm(p.title);
      return n.length >= 6 && t.includes(` ${n} `);
    })
    .map((p) => p.title)
    .slice(0, 5);
}

/** Brands recommended in an answer, in the order the answer recommends them. */
export type RankedBrands = string[];

/**
 * Reads each engine's answer for one prompt and lists the brands it recommends, in order.
 * One LLM call per prompt (all engines' answers together). Falls back to a list/bold-text parser.
 */
export async function extractRankedBrands(prompt: string, answers: Array<{ engine: EngineId; text: string }>): Promise<Record<string, RankedBrands>> {
  const out: Record<string, RankedBrands> = {};
  const withText = answers.filter((a) => a.text.trim());
  if (withText.length === 0) return out;

  if (llmProvider()) {
    try {
      const system =
        'You read AI shopping answers and list the brands/stores each answer recommends, in the order they are recommended. ' +
        'Only brand or store names (not product types, not retailers like Amazon unless recommended as the place to buy). ' +
        'Merge product names into their brand. Max 10 per answer. Reply as JSON: {"answers":[{"engine":"<id>","brands":["Brand A","Brand B"]}]}';
      const user = `Shopper question: ${prompt}\n\n` + withText.map((a) => `### engine: ${a.engine}\n${a.text.slice(0, 6000)}`).join('\n\n');
      const res = await generateJson<{ answers?: Array<{ engine?: string; brands?: unknown[] }> }>(system, user, { maxTokens: 800 });
      for (const a of res.answers || []) {
        if (!a?.engine || !Array.isArray(a.brands)) continue;
        out[a.engine] = a.brands.filter((x): x is string => typeof x === 'string' && x.trim().length > 1).map((x) => x.trim().slice(0, 80)).slice(0, 10);
      }
    } catch (e) {
      console.warn('brand extraction via LLM failed, using parser', (e as Error).message);
    }
  }
  for (const a of withText) if (!out[a.engine]) out[a.engine] = parseBrandsHeuristic(a.text);
  return out;
}

/** Fallback: bold names and list-item leads ("1. Brand – ...", "- **Brand**: ..."). */
export function parseBrandsHeuristic(text: string): RankedBrands {
  const found: string[] = [];
  const add = (s: string) => {
    const v = s.replace(/[*_`#[\]]/g, '').replace(/\(.*?\)/g, '').trim().replace(/[:.,–—-]+$/, '').trim();
    if (v.length < 2 || v.length > 60 || v.split(' ').length > 6) return;
    if (!found.some((f) => norm(f) === norm(v))) found.push(v);
  };
  for (const m of text.matchAll(/\*\*([^*\n]{2,80})\*\*/g)) add(m[1]);
  if (found.length === 0) {
    for (const line of text.split('\n')) {
      const m = line.match(/^\s*(?:\d+[.)]|[-•*])\s+([^:–—\n]{2,60})(?:[:–—]|\s-\s)/);
      if (m) add(m[1]);
    }
  }
  return found.slice(0, 10);
}

/** Turns the ranked list into our position + competitors, using the brand matcher. */
export function rankFromList(list: RankedBrands, b: BrandIdentity): { position: number | null; competitors: EngineCompetitor[] } {
  let position: number | null = null;
  const competitors: EngineCompetitor[] = [];
  list.forEach((name, i) => {
    if (position === null && mentionsBrand(name, b)) position = i + 1;
    else if (!mentionsBrand(name, b)) competitors.push({ name, rank: i + 1 });
  });
  return { position, competitors: competitors.slice(0, 8) };
}
