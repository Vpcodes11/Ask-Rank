import { fetchPublic, htmlToText, jsonLdBlocks, typesOf } from './store-fetcher';
import { generateJson } from './llm';
import { mapLimit } from './util';
import type { DeepAudit, ProductAudit, PromptRunResult, StoreProduct, StoreSnapshot } from './types';

/** Checks one product page's JSON-LD and copy. Everything here comes from the live page. */
export async function auditProductPage(p: StoreProduct): Promise<ProductAudit> {
  let html = '';
  try {
    const res = await fetchPublic(p.url, { accept: 'text/html', browser: true, timeout: 12_000 });
    if (res.ok) html = await res.text();
  } catch {
    /* counted as not fetched */
  }
  const nodes = jsonLdBlocks(html);
  const product = nodes.find((n) => typesOf(n).some((t) => t === 'Product' || t === 'ProductGroup'));
  const offersRaw = product?.offers ?? product?.hasVariant?.[0]?.offers;
  const offers = Array.isArray(offersRaw) ? offersRaw[0] : offersRaw;
  const rating = product?.aggregateRating;
  const count = Number(rating?.reviewCount ?? rating?.ratingCount ?? NaN);

  let ratingIssue: string | null = null;
  if (rating) {
    if (!Number.isFinite(count)) ratingIssue = 'AggregateRating has no reviewCount or ratingCount, so it is not eligible for rich results.';
    else if (count === 0) ratingIssue = 'AggregateRating reports 0 reviews. Remove it until real reviews exist.';
  }

  const text = (p.description || htmlToText(String(product?.description || ''))).toLowerCase();
  const words = text.split(/\s+/).filter(Boolean).length;
  const gaps: string[] = [];
  if (words < 80) gaps.push(`Short description (${words} words). AI answers favour pages that state specifics.`);
  if (!/\d\s?(ml|l|g|kg|mg|oz|lb|cm|mm|m|in|inch|"|gsm|%|w|mah|hours?|days?)\b/.test(text)) gaps.push('No measurable specs (sizes, weights, percentages, capacity).');
  if (!/(made (of|from|with)|material|fabric|ingredient|cotton|leather|steel|wood|formula|blend)/.test(text)) gaps.push('Materials or ingredients are not stated.');
  if (!/(ideal for|best for|perfect for|designed for|great for|use it|suitable for|who it'?s for)/.test(text)) gaps.push('Does not say who it is for or when to use it.');
  if (!/(size|fit|dimension|length|width|height|capacity|compatib)/.test(text)) gaps.push('No sizing, fit or dimensions.');
  if (!/(care|wash|clean|how to use|directions|warranty|return)/.test(text)) gaps.push('No care, usage, warranty or returns details.');

  const fetched = Boolean(html);
  const checks = {
    hasProductSchema: Boolean(product),
    hasOffer: Boolean(offers),
    hasPrice: Boolean(offers?.price ?? offers?.lowPrice),
    hasAvailability: Boolean(offers?.availability),
    hasBrand: Boolean(product?.brand),
    hasGtinOrSku: Boolean(product?.sku || product?.gtin || product?.gtin13 || product?.gtin12 || product?.mpn),
    hasAggregateRating: Boolean(rating),
    hasFaqSchema: nodes.some((n) => typesOf(n).includes('FAQPage')),
  };
  if (fetched) {
    if (!checks.hasProductSchema) gaps.unshift('No Product structured data on the page.');
    else {
      if (!checks.hasPrice || !checks.hasAvailability) gaps.push('Offer is missing price or availability in structured data.');
      if (!checks.hasBrand) gaps.push('Product structured data has no brand.');
      if (!checks.hasGtinOrSku) gaps.push('No SKU, GTIN or MPN in structured data.');
    }
    if (!checks.hasFaqSchema) gaps.push('No FAQ section marked up with FAQPage.');
  }
  if (ratingIssue) gaps.push(ratingIssue);

  const weights = [
    !checks.hasProductSchema ? 25 : 0,
    !checks.hasPrice || !checks.hasAvailability ? 10 : 0,
    !checks.hasBrand ? 5 : 0,
    !checks.hasGtinOrSku ? 5 : 0,
    ratingIssue ? 10 : 0,
    !checks.hasFaqSchema ? 10 : 0,
  ];
  const copyGaps = gaps.filter((g) => !/structured data|FAQPage|AggregateRating|SKU/.test(g)).length;
  const gapScore = Math.min(100, (fetched ? weights.reduce((a, b) => a + b, 0) : 0) + copyGaps * 6);

  return { title: p.title, url: p.url, fetched, ...checks, ratingIssue, descriptionWords: words, gaps, gapScore };
}

/** Where competitors get cited but the store is not mentioned: outreach / PR targets. */
export function citationTargets(results: PromptRunResult[], storeDomain: string) {
  const map = new Map<string, { domain: string; url: string; competitors: Set<string>; count: number }>();
  for (const r of results) {
    if (r.mentioned || r.competitors.length === 0) continue;
    for (const s of r.sources) {
      if (!s.domain || s.domain === storeDomain || s.domain.endsWith(`.${storeDomain}`)) continue;
      const e = map.get(s.domain) || { domain: s.domain, url: s.url, competitors: new Set<string>(), count: 0 };
      e.count++;
      r.competitors.slice(0, 3).forEach((c) => e.competitors.add(c.name));
      map.set(s.domain, e);
    }
  }
  return [...map.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 15)
    .map((e) => ({ domain: e.domain, url: e.url, competitorsNamed: [...e.competitors].slice(0, 5), count: e.count }));
}

export async function buildDeepAudit(snapshot: StoreSnapshot, results: PromptRunResult[]): Promise<DeepAudit> {
  const products = await mapLimit(snapshot.products.slice(0, 10), 4, auditProductPage);
  const site = {
    hasOrganizationSchema: snapshot.homepageJsonLdTypes.some((t) => t === 'Organization' || t === 'OnlineStore' || t === 'Brand'),
    hasLlmsTxt: snapshot.llmsTxtFound,
    hasSitemap: snapshot.sitemapFound,
    productsJsonPublic: snapshot.productsJsonFound,
  };
  const recommendations: string[] = [];
  const noSchema = products.filter((p) => p.fetched && !p.hasProductSchema).length;
  if (noSchema) recommendations.push(`${noSchema} of ${products.length} product pages have no Product structured data. Most Shopify themes add it; check your theme or app settings.`);
  const ratingIssues = products.filter((p) => p.ratingIssue).length;
  if (ratingIssues) recommendations.push(`${ratingIssues} product pages have review markup without a valid review count. Fix or remove it.`);
  const thin = products.filter((p) => p.descriptionWords < 80).length;
  if (thin) recommendations.push(`${thin} product descriptions are under 80 words. Add specs, materials, who it is for and sizing; the Content Fixer drafts these from your existing copy.`);
  if (!site.hasOrganizationSchema) recommendations.push('Homepage has no Organization structured data (name, logo, social profiles). AI engines use it to recognise your brand.');
  if (!site.hasLlmsTxt) recommendations.push('No /llms.txt file. Add one that lists your key pages so AI crawlers find them (generated below).');
  const targets = citationTargets(results, snapshot.domain);
  if (targets.length) recommendations.push(`AI answers that named competitors but not you cited ${targets.length} sites. Getting listed or reviewed on the top ones is the fastest route into those answers.`);
  if (products.length === 0) recommendations.push('No public product data was found (/products.json is closed), so product pages could not be audited.');

  return { generatedAt: new Date().toISOString(), products, site, citationTargets: targets, recommendations };
}

/** llms.txt draft from real store data only. Placeholders mark what the merchant must fill in. */
export function generateLlmsTxt(snapshot: StoreSnapshot): string {
  const lines = [
    `# ${snapshot.storeName}`,
    '',
    `> ${snapshot.homepageDescription || '[ADD: one sentence describing what you sell and who it is for]'}`,
    '',
    '## Key pages',
    `- [Home](https://${snapshot.domain}/)`,
    `- [All products](https://${snapshot.domain}/collections/all)`,
    `- [Shipping policy](https://${snapshot.domain}/policies/shipping-policy)`,
    `- [Refund policy](https://${snapshot.domain}/policies/refund-policy)`,
    '',
    '## Products',
  ];
  for (const p of snapshot.products.slice(0, 30)) {
    const summary = p.description.replace(/\s+/g, ' ').slice(0, 160);
    lines.push(`- [${p.title}](${p.url})${summary ? `: ${summary}` : ''}`);
  }
  if (snapshot.products.length === 0) lines.push('- [ADD: links to your best-selling products]');
  return lines.join('\n') + '\n';
}

/** Product JSON-LD built from the store's real data (no invented ratings or prices). */
export function productJsonLd(p: StoreProduct, brand: string, currency: string): string {
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: p.title,
    description: p.description.slice(0, 5000) || undefined,
    image: p.imageUrl || undefined,
    brand: { '@type': 'Brand', name: brand },
    offers: p.price
      ? { '@type': 'Offer', url: p.url, priceCurrency: currency, price: p.price, availability: 'https://schema.org/InStock' }
      : undefined,
  };
  return `<script type="application/ld+json">\n${JSON.stringify(data, null, 2)}\n</script>`;
}

export type FixType = 'description' | 'faqs' | 'schema';

/**
 * Drafts improved product content. The model may only reuse facts already in the product data;
 * anything it would need to know but doesn't is left as an [ADD: ...] placeholder for the merchant.
 */
export async function draftContentFix(p: StoreProduct, type: FixType, ctx: { brand: string; currency: string; prompts: string[] }): Promise<string> {
  if (type === 'schema') return productJsonLd(p, ctx.brand, ctx.currency);
  const facts = `Brand: ${ctx.brand}\nProduct: ${p.title}\nPrice: ${p.price} ${ctx.currency}\nTags: ${p.tags.join(', ')}\nCurrent description:\n${p.description.slice(0, 4000) || '(empty)'}`;
  const rules =
    'Rules: use ONLY facts present in the product data. Never invent specs, materials, certifications, ratings, review counts, awards or competitor claims. ' +
    'Where a shopper would need a fact that is missing, write a placeholder like [ADD: fabric composition]. Plain, specific language, no hype.';
  if (type === 'description') {
    const res = await generateJson<{ description: string }>(
      `You write Shopify product descriptions that AI shopping assistants can quote. ${rules} ` +
        'Structure: 1-2 sentence summary, then short sections in Markdown: "Key details" (bullets), "Who it is for", "Size and fit" or "How to use", "Care". Reply as JSON {"description": "..."}',
      `${facts}\n\nShopper questions this product should answer:\n${ctx.prompts.slice(0, 6).map((q) => `- ${q}`).join('\n')}`,
      { maxTokens: 1500 },
    );
    return String(res.description || '').trim();
  }
  const res = await generateJson<{ faqs: Array<{ q: string; a: string }> }>(
    `You write product FAQs that answer real shopper questions. ${rules} 4-6 FAQs. Reply as JSON {"faqs":[{"q":"...","a":"..."}]}`,
    `${facts}\n\nShopper questions seen in AI search:\n${ctx.prompts.slice(0, 8).map((q) => `- ${q}`).join('\n')}`,
    { maxTokens: 1500 },
  );
  const faqs = (res.faqs || []).filter((f) => f?.q && f?.a).slice(0, 6);
  const md = faqs.map((f) => `**${f.q}**\n${f.a}`).join('\n\n');
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };
  return `${md}\n\n<!-- Paste below into the product page template (only after replacing every [ADD: ...]) -->\n<script type="application/ld+json">\n${JSON.stringify(ld, null, 2)}\n</script>`;
}
