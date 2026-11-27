import type { CitationSourceStats, CompetitorStats, PromptRunResult, ScanBreakdown } from './types';
import { norm } from './analyze';

/**
 * AI Visibility Score (0-100), from answers that came back without an error:
 *   45% mention rate        share of answers that name the brand
 *   25% position            rank when named (#1 = 100, #2 = 75, #3 = 55, lower/unranked = 35)
 *   15% engine coverage     share of engines that named the brand at least once
 *   15% citation rate       share of answers that cite the store's own site
 */
export function calculateAIVisibilityScore(all: PromptRunResult[]): {
  score: number;
  breakdown: ScanBreakdown;
  competitors: CompetitorStats[];
  sources: CitationSourceStats[];
} {
  const results = all.filter((r) => !r.error);
  const total = results.length;
  if (total === 0) {
    return { score: 0, breakdown: { mention_rate: 0, avg_position: null, engine_diversity: 0, citation_rate: 0 }, competitors: [], sources: [] };
  }

  const mentioned = results.filter((r) => r.mentioned);
  const mentionRate = Math.round((mentioned.length / total) * 100);

  const ranked = mentioned.filter((r) => r.position !== null);
  const avgPosition = ranked.length ? Number((ranked.reduce((a, r) => a + (r.position as number), 0) / ranked.length).toFixed(1)) : null;
  const posPoints = (p: number | null) => (p === 1 ? 100 : p === 2 ? 75 : p === 3 ? 55 : 35);
  const positionScore = mentioned.length ? mentioned.reduce((a, r) => a + posPoints(r.position), 0) / mentioned.length : 0;

  const engines = new Set(results.map((r) => r.engine));
  const enginesWithMention = new Set(mentioned.map((r) => r.engine));
  const engineDiversity = Math.round((enginesWithMention.size / engines.size) * 100);

  const citationRate = Math.round((results.filter((r) => r.cited).length / total) * 100);

  const score = Math.round(mentionRate * 0.45 + positionScore * 0.25 + engineDiversity * 0.15 + citationRate * 0.15);

  // Competitors: merge spelling variants by normalised name.
  const comp = new Map<string, { name: string; count: number; ranks: number[] }>();
  for (const r of results) {
    const seen = new Set<string>();
    for (const c of r.competitors) {
      const key = norm(c.name);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      const e = comp.get(key) || { name: c.name, count: 0, ranks: [] };
      e.count++;
      if (c.rank) e.ranks.push(c.rank);
      comp.set(key, e);
    }
  }
  const competitors = [...comp.values()]
    .map((e) => ({
      name: e.name,
      mentionCount: e.count,
      percentage: Math.round((e.count / total) * 100),
      avgPosition: e.ranks.length ? Number((e.ranks.reduce((a, b) => a + b, 0) / e.ranks.length).toFixed(1)) : null,
    }))
    .sort((a, b) => b.mentionCount - a.mentionCount)
    .slice(0, 10);

  const src = new Map<string, { url: string; count: number }>();
  for (const r of results) for (const s of r.sources) {
    const e = src.get(s.domain) || { url: s.url, count: 0 };
    e.count++;
    src.set(s.domain, e);
  }
  const sources = [...src.entries()]
    .map(([domain, e]) => ({ domain, url: e.url, frequency: e.count, tier: tierOf(domain) }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 12);

  return { score, breakdown: { mention_rate: mentionRate, avg_position: avgPosition, engine_diversity: engineDiversity, citation_rate: citationRate }, competitors, sources };
}

export function tierOf(domain: string): CitationSourceStats['tier'] {
  if (/reddit\.|quora\.|forum|community|stackexchange|discord/.test(domain)) return 'Community & forums';
  if (/youtube\.|tiktok\.|instagram\./.test(domain)) return 'Video';
  if (/amazon\.|flipkart\.|nykaa\.|myntra\.|walmart\.|etsy\.|ebay\.|target\.|meesho\./.test(domain)) return 'Marketplace';
  if (/vogue|nytimes|forbes|gq|wirecutter|cnn|bbc|theguardian|businessinsider|indiatoday|ndtv|hindustantimes|timesofindia|elle|allure|cosmopolitan|healthline|verywell|byrdie|refinery29|buzzfeed|techradar|tomsguide|cnet|theverge|wired/.test(domain))
    return 'Media & editorial';
  if (/blog|review|guide|best|top/.test(domain)) return 'Other';
  return 'Brand site';
}

export { getScoreLabel } from './score-label';
