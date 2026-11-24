import { AIEngine, EngineAnswer, ENGINE_TIMEOUT_MS, dedupeSources, failText, toSource } from './base';

/** Perplexity Sonar: live web search with citations. Docs: https://docs.perplexity.ai */
export class PerplexityEngine implements AIEngine {
  id = 'perplexity' as const;
  name = 'Perplexity';

  isConfigured() {
    return Boolean(process.env.PERPLEXITY_API_KEY);
  }

  async ask(prompt: string, opts: { country?: string } = {}): Promise<EngineAnswer> {
    const body: Record<string, unknown> = {
      model: process.env.PERPLEXITY_MODEL || 'sonar',
      messages: [{ role: 'user', content: prompt }],
    };
    if (opts.country) body.web_search_options = { user_location: { country: opts.country } };

    const res = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}` },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(ENGINE_TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`Perplexity ${await failText(res)}`);
    return parsePerplexity(await res.json());
  }
}

export function parsePerplexity(data: any): EngineAnswer {
  const text: string = data?.choices?.[0]?.message?.content || '';
  const results: Array<{ url?: string; title?: string }> = Array.isArray(data?.search_results) ? data.search_results : [];
  const citations: string[] = Array.isArray(data?.citations) ? data.citations : [];
  const sources = dedupeSources([
    ...results.map((r) => (r.url ? toSource(r.url, r.title) : null)),
    ...citations.map((u) => toSource(u)),
  ]);
  return { text, sources };
}
