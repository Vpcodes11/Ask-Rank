import { generateJson, llmProvider } from './llm';
import type { BuyerPrompt, StoreSnapshot } from './types';

const CATEGORIES: BuyerPrompt['category'][] = ['intent_buy', 'comparison', 'budget', 'spec', 'gift_occasion'];
const SYMBOL: Record<string, string> = { INR: '₹', USD: '$', GBP: '£', EUR: '€', AUD: 'A$', CAD: 'C$' };
const COUNTRY_NAME: Record<string, string> = { INR: 'India', USD: 'the US', GBP: 'the UK', AUD: 'Australia', CAD: 'Canada' };

/**
 * Writes `count` questions a real shopper would type into ChatGPT/Perplexity/Gemini when looking for
 * what this store sells. Most prompts must NOT name the brand (we measure organic recommendations);
 * a couple are brand-check prompts ("is X worth it").
 */
export async function generateBuyerPrompts(s: StoreSnapshot, count: number, nicheHint?: string): Promise<{ niche: string; prompts: BuyerPrompt[] }> {
  if (llmProvider()) {
    try {
      const catalog = s.products
        .slice(0, 15)
        .map((p) => `- ${p.title}${p.price ? ` (${SYMBOL[s.currency] || ''}${p.price})` : ''}${p.tags.length ? ` [${p.tags.slice(0, 5).join(', ')}]` : ''}`)
        .join('\n');
      const brandChecks = count >= 8 ? 2 : 1;
      const res = await generateJson<{ niche?: string; prompts?: Array<{ query?: string; category?: string; intent?: string }> }>(
        'You write realistic shopping questions people type into AI assistants. Reply as JSON: ' +
          '{"niche":"<3-6 word category this store sells, e.g. Women\'s activewear>","prompts":[{"query":"...","category":"intent_buy|comparison|budget|spec|gift_occasion","intent":"<who is asking and why, 6-12 words>"}]}',
        `Store: ${s.storeName} (${s.domain})\nHomepage title: ${s.homepageTitle}\nDescription: ${s.homepageDescription}\n` +
          `${nicheHint ? `Merchant says the category is: ${nicheHint}\n` : ''}Shopper market: ${COUNTRY_NAME[s.currency] || 'global'}; currency ${s.currency}.\n` +
          `Products:\n${catalog || '(product list not public)'}\n\n` +
          `Write exactly ${count} prompts. ${count - brandChecks} must NOT mention ${s.storeName} and should be the kind of question where this store's products could reasonably be recommended ` +
          `(best X for Y, X under a realistic price in ${s.currency}, X vs Y, gift ideas, specific needs). ${brandChecks} should ask directly about ${s.storeName} (reviews, is it worth it, alternatives). ` +
          'Natural phrasing, 6-18 words, varied categories, no duplicates.',
        { maxTokens: 1500 },
      );
      const prompts = (res.prompts || [])
        .filter((p) => typeof p?.query === 'string' && p.query.trim().length > 8)
        .slice(0, count)
        .map((p, i) => ({
          id: `prompt-${i + 1}`,
          query: p.query!.trim().slice(0, 240),
          category: CATEGORIES.includes(p.category as BuyerPrompt['category']) ? (p.category as BuyerPrompt['category']) : 'intent_buy',
          intent: String(p.intent || '').slice(0, 140),
        }));
      if (prompts.length >= Math.min(count, 3)) {
        return { niche: String(res.niche || nicheHint || 'Online store').slice(0, 80), prompts };
      }
    } catch (e) {
      console.warn('prompt generation via LLM failed, using templates', (e as Error).message);
    }
  }
  const niche = nicheHint?.trim() || guessNiche(s);
  return { niche, prompts: templatePrompts(s, niche, count) };
}

function guessNiche(s: StoreSnapshot): string {
  const tags = s.products.flatMap((p) => p.tags).map((t) => t.toLowerCase());
  const top = mostCommon(tags.filter((t) => t.length > 2 && t.length < 30));
  return top || s.homepageTitle.split(/[|–—-]/).pop()?.trim().slice(0, 60) || 'products';
}

function mostCommon(xs: string[]): string | null {
  const m = new Map<string, number>();
  xs.forEach((x) => m.set(x, (m.get(x) || 0) + 1));
  return [...m.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
}

/** Neutral fallback prompts built from the niche and real prices. */
export function templatePrompts(s: StoreSnapshot, niche: string, count: number): BuyerPrompt[] {
  const sym = SYMBOL[s.currency] || '';
  const prices = s.products.map((p) => Number(p.price)).filter((n) => Number.isFinite(n) && n > 0).sort((a, b) => a - b);
  const median = prices.length ? prices[Math.floor(prices.length / 2)] : 0;
  const budget = median ? `${sym}${roundUp(median * 1.3)}` : '';
  const where = COUNTRY_NAME[s.currency] ? ` in ${COUNTRY_NAME[s.currency]}` : '';
  const product = s.products[0]?.title?.split(/[-–|,]/)[0]?.trim();
  const t: Array<[BuyerPrompt['category'], string, string]> = [
    ['intent_buy', `best ${niche} brands${where}`, 'Shopper comparing brands before buying'],
    ['budget', budget ? `best ${niche} under ${budget}` : `best affordable ${niche}`, 'Price-conscious buyer'],
    ['intent_buy', `top rated ${niche} with good reviews`, 'Buyer looking for social proof'],
    ['comparison', `${s.storeName} reviews: is it worth buying?`, 'Brand check before purchase'],
    ['spec', `what should I look for when buying ${niche}?`, 'First-time buyer researching'],
    ['gift_occasion', `${niche} gift ideas${where}`, 'Gift shopper'],
    ['intent_buy', product ? `where to buy ${product.toLowerCase()} online` : `where to buy ${niche} online`, 'Ready-to-buy shopper'],
    ['comparison', `${s.storeName} alternatives`, 'Shopper comparing options'],
    ['intent_buy', `best ${niche} for beginners`, 'New customer to the category'],
    ['spec', `most durable ${niche} worth the money`, 'Quality-focused buyer'],
  ];
  return t.slice(0, count).map(([category, query, intent], i) => ({ id: `prompt-${i + 1}`, query, category, intent }));
}

function roundUp(n: number): number {
  const step = n > 1000 ? 500 : n > 100 ? 50 : 5;
  return Math.ceil(n / step) * step;
}
