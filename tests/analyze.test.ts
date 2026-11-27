import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mentionsBrand, citesStore, parseBrandsHeuristic, rankFromList, productsMentioned } from '../src/lib/analyze';
import { calculateAIVisibilityScore } from '../src/lib/scoring';
import { normalizeDomain } from '../src/lib/util';
import { pickStoreName, detectCurrency } from '../src/lib/store-fetcher';
import { templatePrompts } from '../src/lib/prompt-generator';
import type { PromptRunResult, StoreSnapshot } from '../src/lib/types';

const blue = { name: 'Blue Tokai Coffee Roasters', domain: 'bluetokaicoffee.com' };

test('brand matching: name, first word, squashed domain', () => {
  assert.ok(mentionsBrand('I recommend Blue Tokai Coffee Roasters.', blue));
  assert.ok(mentionsBrand('Try bluetokaicoffee.com for beans', blue));
  assert.ok(mentionsBrand('**Blue Tokai** has great single origins', { name: 'Blue Tokai', domain: 'bluetokai.com' }));
  assert.ok(!mentionsBrand('Sleepy Owl and Third Wave are good', blue));
});

test('brand matching does not fire on substrings of other words', () => {
  const acme = { name: 'Nova', domain: 'nova.com' };
  assert.ok(!mentionsBrand('Casanova shoes are popular', acme));
  assert.ok(mentionsBrand('Nova shoes are popular', acme));
});

test('generic store names do not match everything', () => {
  assert.ok(!mentionsBrand('Visit the official store online', { name: 'Store', domain: 'shop.com' }));
});

test('own-site citation includes subdomains', () => {
  assert.ok(citesStore([{ domain: 'shop.acme.com', url: 'https://shop.acme.com', title: '' }], 'acme.com'));
  assert.ok(!citesStore([{ domain: 'notacme.com', url: 'https://notacme.com', title: '' }], 'acme.com'));
});

test('heuristic brand parser reads bold names then list items', () => {
  assert.deepEqual(parseBrandsHeuristic('1. **Gymshark** – great\n2. **Lululemon Align** (pricey)'), ['Gymshark', 'Lululemon Align']);
  assert.deepEqual(parseBrandsHeuristic('1. Decathlon: cheap\n2. Puma - durable'), ['Decathlon', 'Puma']);
});

test('rank from list finds our position and lists the rest as competitors', () => {
  const r = rankFromList(['Sleepy Owl', 'Blue Tokai', 'Third Wave'], blue);
  assert.equal(r.position, 2);
  assert.deepEqual(r.competitors.map((c) => c.name), ['Sleepy Owl', 'Third Wave']);
});

test('products mentioned by full title only', () => {
  const products = [{ title: 'Vienna Roast Beans', handle: 'v', description: '', price: '', url: '', tags: [] }];
  assert.deepEqual(productsMentioned('Their Vienna Roast Beans are bold', products), ['Vienna Roast Beans']);
  assert.deepEqual(productsMentioned('Vienna is lovely', products), []);
});

function run(p: Partial<PromptRunResult>): PromptRunResult {
  return { id: 'x', prompt_id: 'p', prompt: 'q', engine: 'perplexity', engine_name: 'P', mentioned: false, cited: false, mentioned_products: [], position: null, competitors: [], sources: [], raw_response: '', run_at: '', ...p };
}

test('score: never mentioned = 0, errors are excluded', () => {
  const s = calculateAIVisibilityScore([run({}), run({ engine: 'openai_search' }), run({ error: 'down', mentioned: true })]);
  assert.equal(s.score, 0);
  assert.equal(s.breakdown.mention_rate, 0);
  assert.equal(s.breakdown.avg_position, null);
});

test('score: always #1 on every engine and cited = 100', () => {
  const s = calculateAIVisibilityScore([
    run({ mentioned: true, position: 1, cited: true }),
    run({ engine: 'openai_search', mentioned: true, position: 1, cited: true }),
  ]);
  assert.equal(s.score, 100);
});

test('score: competitors merged across spellings and counted once per answer', () => {
  const s = calculateAIVisibilityScore([
    run({ competitors: [{ name: 'Gymshark', rank: 1 }, { name: 'gymshark', rank: 3 }] }),
    run({ engine: 'gemini_grounding', competitors: [{ name: 'GymShark', rank: 2 }] }),
  ]);
  assert.equal(s.competitors[0].mentionCount, 2);
  assert.equal(s.competitors[0].avgPosition, 1.5);
});

test('normalizeDomain accepts URLs, rejects local targets', () => {
  assert.equal(normalizeDomain('https://www.Acme.com/products/x?y=1'), 'acme.com');
  assert.equal(normalizeDomain('acme.myshopify.com'), 'acme.myshopify.com');
  assert.equal(normalizeDomain('localhost'), null);
  assert.equal(normalizeDomain('http://127.0.0.1:3000'), null);
  assert.equal(normalizeDomain('not a url'), null);
});

test('store name from og:site_name, title, or domain', () => {
  assert.equal(pickStoreName('Acme', 'whatever', 'acme.com'), 'Acme');
  assert.equal(pickStoreName('', 'Leggings & more – Acme Active', 'acmeactive.com'), 'Acme Active');
  assert.equal(pickStoreName('', '', 'blue-tokai.com'), 'Blue Tokai');
});

test('currency detection', () => {
  assert.equal(detectCurrency('<script>Shopify.currency = {"active":"INR","rate":"1.0"};</script>', 'x.com'), 'INR');
  assert.equal(detectCurrency('', 'shop.co.uk'), 'GBP');
  assert.equal(detectCurrency('', 'shop.com'), 'USD');
});

test('template prompts use real prices and never invent competitor brands', () => {
  const s: StoreSnapshot = {
    domain: 'acme.in', storeName: 'Acme', homepageTitle: '', homepageDescription: '', isShopify: true, productsJsonFound: true,
    sitemapFound: true, llmsTxtFound: false, homepageJsonLdTypes: [], currency: 'INR',
    products: [{ title: 'Yoga Mat', handle: 'm', description: '', price: '1200', url: '', tags: [] }],
  };
  const ps = templatePrompts(s, 'yoga mats', 10);
  assert.equal(ps.length, 10);
  assert.ok(ps.some((p) => p.query.includes('₹2000')));
});
