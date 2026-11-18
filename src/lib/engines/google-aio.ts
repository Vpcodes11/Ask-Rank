import { AIEngineAdapter, EngineContext, EngineRunOutput } from './base';
import { getIntelForNiche } from './niche-intelligence';
import { EngineCompetitor } from '../types';

export class GoogleAIOverviewsEngineAdapter implements AIEngineAdapter {
  id = 'google_aio' as const;
  name = 'Google AI Overviews';
  provider = 'Google Search';
  description = 'Direct AI Overviews displayed at the top of Google search results for commercial intent queries';
  badgeColor = '#ea4335';
  isLiveSupported = false; // direct scrape/simulated API

  isConfigured(): boolean {
    return true;
  }

  async query(prompt: string, context: EngineContext): Promise<EngineRunOutput> {
    const nicheIntel = getIntelForNiche(context.niche);
    const brandLower = context.brandName.toLowerCase();
    const promptLower = prompt.toLowerCase();

    const isBrandSpecific = promptLower.includes(brandLower);
    const hash = (prompt + 'gaio' + context.brandName).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const mentioned = isBrandSpecific || (hash % 10 < 3);

    let position: number | null = null;
    const mentionedProducts: string[] = [];

    if (mentioned) {
      position = (hash % 2) + 1;
      if (context.sampleProducts && context.sampleProducts.length > 0) {
        mentionedProducts.push(context.sampleProducts[0].title);
      } else {
        mentionedProducts.push(`${context.brandName} Featured Edition`);
      }
    }

    const competitors: EngineCompetitor[] = nicheIntel.competitors
      .filter(c => c.toLowerCase() !== brandLower)
      .slice(0, 3)
      .map((name, idx) => ({
        name,
        rank: idx + 1,
        snippet: `Featured in Google AI Overview bullet summary for ${context.niche}`
      }));

    const rawResponse = mentioned
      ? `AI Overview snapshot:\nFor shoppers searching "${prompt}", top rated options synthesized from web reviews include:\n• ${position === 1 ? context.brandName : competitors[0]?.name}: Known for verified clean ingredients and durable quality.\n• ${position === 2 ? context.brandName : competitors[1]?.name}: Frequently chosen for reliable value and rapid shipping.\n• ${competitors[2]?.name}: Well-reviewed in editorial roundups.`
      : `AI Overview snapshot:\nShoppers looking for "${prompt}" typically consider these primary choices:\n• ${competitors[0]?.name}: Best overall for price-to-performance according to independent lab tests.\n• ${competitors[1]?.name}: Top pick for durability and ingredient transparency.\n• ${competitors[2]?.name}: Popular community pick on forum discussions.\n\n*${context.brandName} did not appear in the top synthesized overview.*`;

    return {
      mentioned,
      productMentioned: mentionedProducts.length > 0,
      mentionedProducts,
      position,
      competitors,
      sources: nicheIntel.sources.slice(0, 3),
      rawResponse
    };
  }
}
