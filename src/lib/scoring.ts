import { PromptRunResult, ScanBreakdown, CompetitorStats, CitationSourceStats } from './types';

export function calculateAIVisibilityScore(results: PromptRunResult[], brandName: string): {
  score: number;
  breakdown: ScanBreakdown;
  competitorsFound: CompetitorStats[];
  topSources: CitationSourceStats[];
} {
  if (!results || results.length === 0) {
    return {
      score: 15,
      breakdown: { mention_rate: 10, avg_position: 3, engine_diversity: 15, source_authority: 20 },
      competitorsFound: [],
      topSources: []
    };
  }

  // 1. Mention Rate (0 - 100)
  const totalRuns = results.length;
  const mentions = results.filter(r => r.mentioned).length;
  const mentionRate = Math.round((mentions / totalRuns) * 100);

  // 2. Average Position Score
  const mentionedRuns = results.filter(r => r.mentioned && r.position !== null);
  let positionScore = 0;
  let avgPosition = 0;

  if (mentionedRuns.length > 0) {
    const sumPos = mentionedRuns.reduce((acc, r) => acc + (r.position || 3), 0);
    avgPosition = Number((sumPos / mentionedRuns.length).toFixed(1));
    // Position 1 -> 100%, Position 2 -> 70%, Position 3 -> 40%
    const normalizedPosScore = mentionedRuns.reduce((acc, r) => {
      if (r.position === 1) return acc + 100;
      if (r.position === 2) return acc + 70;
      return acc + 40;
    }, 0) / mentionedRuns.length;
    positionScore = Math.round(normalizedPosScore);
  } else {
    avgPosition = 0;
    positionScore = 0;
  }

  // 3. Engine Diversity
  const enginesWithMentions = new Set(results.filter(r => r.mentioned).map(r => r.engine));
  const uniqueEnginesTotal = new Set(results.map(r => r.engine)).size || 1;
  const engineDiversity = Math.round((enginesWithMentions.size / uniqueEnginesTotal) * 100);

  // 4. Source Authority & Coverage
  const sourceDomains = new Map<string, { url: string; count: number }>();
  for (const r of results) {
    for (const s of r.sources) {
      const existing = sourceDomains.get(s.domain) || { url: s.url, count: 0 };
      existing.count += 1;
      sourceDomains.set(s.domain, existing);
    }
  }

  // Calculate score for source coverage
  const highAuthDomains = ['reddit.com', 'nytimes.com', 'vogue.in', 'forbes.com', 'gq.com', 'nykaa.com', 'runnersworld.com'];
  let authorityHits = 0;
  for (const domain of sourceDomains.keys()) {
    if (highAuthDomains.some(h => domain.includes(h))) {
      authorityHits++;
    }
  }
  const sourceAuthority = Math.min(100, Math.round((authorityHits * 25) + (sourceDomains.size * 5)));

  // Weighted Total Score:
  // Mentions: 40%
  // Position: 25%
  // Source Authority: 20%
  // Engine Diversity: 15%
  const composite = (mentionRate * 0.40) + (positionScore * 0.25) + (sourceAuthority * 0.20) + (engineDiversity * 0.15);
  const score = Math.max(5, Math.min(98, Math.round(composite)));

  // Competitor Aggregation
  const competitorMap = new Map<string, { count: number; positions: number[] }>();
  for (const r of results) {
    for (const c of r.competitors) {
      const name = c.name.trim();
      const existing = competitorMap.get(name) || { count: 0, positions: [] };
      existing.count += 1;
      if (c.rank) existing.positions.push(c.rank);
      competitorMap.set(name, existing);
    }
  }

  const competitorsFound: CompetitorStats[] = Array.from(competitorMap.entries())
    .map(([name, data]) => ({
      name,
      mentionCount: data.count,
      percentage: Math.round((data.count / totalRuns) * 100),
      avgPosition: data.positions.length > 0
        ? Number((data.positions.reduce((a, b) => a + b, 0) / data.positions.length).toFixed(1))
        : 2
    }))
    .sort((a, b) => b.mentionCount - a.mentionCount)
    .slice(0, 6);

  // Top Sources Aggregation
  const topSources: CitationSourceStats[] = Array.from(sourceDomains.entries())
    .map(([domain, data]) => {
      let tier: CitationSourceStats['authority_tier'] = 'Niche Blog';
      if (domain.includes('reddit') || domain.includes('forum') || domain.includes('quora')) {
        tier = 'Community (Reddit/Forums)';
      } else if (domain.includes('vogue') || domain.includes('nytimes') || domain.includes('forbes') || domain.includes('gq')) {
        tier = 'Top Tier (PR/Media)';
      } else if (domain.includes('amazon') || domain.includes('nykaa') || domain.includes('walmart')) {
        tier = 'Marketplace';
      }
      return {
        domain,
        url: data.url,
        frequency: data.count,
        authority_tier: tier
      };
    })
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 8);

  return {
    score,
    breakdown: {
      mention_rate: mentionRate,
      avg_position: avgPosition || 3.0,
      engine_diversity: engineDiversity,
      source_authority: sourceAuthority
    },
    competitorsFound,
    topSources
  };
}

export function getScoreLabel(score: number): { label: string; color: string; bg: string; description: string } {
  if (score >= 80) {
    return {
      label: 'Dominant AI Presence',
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10 border-emerald-500/30',
      description: 'AI engines actively prioritize your store over competitors in direct commercial buyer searches.'
    };
  }
  if (score >= 60) {
    return {
      label: 'Strong Recognition',
      color: 'text-teal-400',
      bg: 'bg-teal-500/10 border-teal-500/30',
      description: 'Frequently cited in top 3 recommendations, with high potential to capture #1 spots with structured data updates.'
    };
  }
  if (score >= 40) {
    return {
      label: 'Moderate Footprint',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/30',
      description: 'Trailing top category competitors. Mentioned occasionally but missing vital specs and citations.'
    };
  }
  if (score >= 20) {
    return {
      label: 'Low AI Visibility',
      color: 'text-orange-400',
      bg: 'bg-orange-500/10 border-orange-500/30',
      description: 'AI assistants predominantly recommend your rivals. Significant content and schema gaps detected.'
    };
  }
  return {
    label: 'AI Invisible',
    color: 'text-rose-500',
    bg: 'bg-rose-500/10 border-rose-500/30',
    description: 'Zero presence in conversational AI searches. AI models lack structured data to recommend your products.'
  };
}
