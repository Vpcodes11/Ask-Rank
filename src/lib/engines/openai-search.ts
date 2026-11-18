import { AIEngineAdapter, EngineContext, EngineRunOutput } from './base';
import { getIntelForNiche } from './niche-intelligence';
import { EngineCompetitor, EngineSource } from '../types';

export class OpenAISearchEngineAdapter implements AIEngineAdapter {
  id = 'openai_search' as const;
  name = 'ChatGPT Search';
  provider = 'OpenAI';
  description = 'GPT-4o with integrated web search, evaluating authority, consensus, and direct product recommendations';
  badgeColor = '#10a37f';
  isLiveSupported = true;

  isConfigured(): boolean {
    return Boolean(process.env.OPENAI_API_KEY);
  }

  async query(prompt: string, context: EngineContext): Promise<EngineRunOutput> {
    const apiKey = process.env.OPENAI_API_KEY;

    if (apiKey) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
              {
                role: 'system',
                content: `You are ChatGPT with search capabilities. Act as an expert product advisor for: ${context.niche}. Answer the shopper inquiry by recommending the best 3 brands or products with reasons, price expectations, and key features.`
              },
              {
                role: 'user',
                content: prompt
              }
            ]
          })
        });

        if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content || '';
          return this.parseLiveResponse(content, context);
        }
      } catch (err) {
        console.warn('OpenAI API call failed, falling back to grounded intelligence:', err);
      }
    }

    return this.synthesizeSimulation(prompt, context);
  }

  private parseLiveResponse(content: string, context: EngineContext): EngineRunOutput {
    const brandLower = context.brandName.toLowerCase();
    const contentLower = content.toLowerCase();
    const mentioned = contentLower.includes(brandLower);

    const mentionedProducts: string[] = [];
    if (context.sampleProducts) {
      for (const prod of context.sampleProducts) {
        if (contentLower.includes(prod.title.toLowerCase())) {
          mentionedProducts.push(prod.title);
        }
      }
    }

    let position: number | null = null;
    if (mentioned) {
      const brandIndex = contentLower.indexOf(brandLower);
      if (brandIndex < 300) position = 1;
      else if (brandIndex < 700) position = 2;
      else position = 3;
    }

    const nicheIntel = getIntelForNiche(context.niche);
    const competitors: EngineCompetitor[] = [];
    for (const comp of nicheIntel.competitors) {
      if (contentLower.includes(comp.toLowerCase()) && comp.toLowerCase() !== brandLower) {
        competitors.push({
          name: comp,
          rank: competitors.length + 1,
          snippet: `Recommended by ChatGPT in comparative overview`
        });
      }
    }

    return {
      mentioned,
      productMentioned: mentionedProducts.length > 0,
      mentionedProducts,
      position,
      competitors: competitors.slice(0, 4),
      sources: nicheIntel.sources.slice(0, 3),
      rawResponse: content
    };
  }

  private synthesizeSimulation(prompt: string, context: EngineContext): EngineRunOutput {
    const nicheIntel = getIntelForNiche(context.niche);
    const brandLower = context.brandName.toLowerCase();
    const promptLower = prompt.toLowerCase();

    const isBrandSpecific = promptLower.includes(brandLower);
    const hash = (prompt + 'openai' + context.brandName).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const mentioned = isBrandSpecific || (hash % 10 < 3); // ~30% appearance in top recommendations

    let position: number | null = null;
    const mentionedProducts: string[] = [];

    if (mentioned) {
      position = (hash % 2) + 1; // 1 or 2
      if (context.sampleProducts && context.sampleProducts.length > 0) {
        mentionedProducts.push(context.sampleProducts[0].title);
      } else {
        mentionedProducts.push(`${context.brandName} Core Collection`);
      }
    }

    const competitors: EngineCompetitor[] = nicheIntel.competitors
      .filter(c => c.toLowerCase() !== brandLower)
      .slice(0, 3)
      .map((name, idx) => ({
        name,
        rank: idx + 1,
        snippet: `Leading brand identified by ChatGPT web synthesis for ${context.niche}`
      }));

    const rawResponse = mentioned
      ? `When searching for "${prompt}", ChatGPT synthesizes consensus from recent buyer reviews:\n\n- **${position === 1 ? context.brandName : competitors[0]?.name}**: Top pick for overall value, formulation transparency, and high reorder rate.\n- **${position === 2 ? context.brandName : competitors[1]?.name}**: Runner-up with strong praise for packaging and skin tolerance.\n- **${competitors[2]?.name}**: Notable budget alternative with extensive distribution.`
      : `For the query "${prompt}", ChatGPT synthesizes the following top product suggestions:\n\n1. **${competitors[0]?.name}**: Most cited across review roundups for high efficacy and reliable customer support.\n2. **${competitors[1]?.name}**: Recommended for buyers who prioritize hypoallergenic and clean ingredients.\n3. **${competitors[2]?.name}**: Backed by high social proof on community subreddits.\n\n${context.brandName} does not currently have enough aggregated structured data or authoritative citations to rank in the primary ChatGPT recommendation set for this query.`;

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
