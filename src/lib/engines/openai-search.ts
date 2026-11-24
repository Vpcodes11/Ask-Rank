import { AIEngine, EngineAnswer, ENGINE_TIMEOUT_MS, dedupeSources, failText, toSource } from './base';

/**
 * ChatGPT-style answers with live web search: OpenAI Responses API + the web_search tool.
 * Docs: https://platform.openai.com/docs/guides/tools-web-search
 */
export class OpenAISearchEngine implements AIEngine {
  id = 'openai_search' as const;
  name = 'ChatGPT Search';

  isConfigured() {
    return Boolean(process.env.OPENAI_API_KEY);
  }

  async ask(prompt: string, opts: { country?: string } = {}): Promise<EngineAnswer> {
    const call = (toolType: string) => {
      const tool: Record<string, unknown> = { type: toolType };
      if (opts.country) tool.user_location = { type: 'approximate', country: opts.country };
      return fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
        body: JSON.stringify({
          model: process.env.OPENAI_SEARCH_MODEL || 'gpt-4.1-mini',
          tools: [tool],
          tool_choice: 'required',
          input: prompt,
        }),
        signal: AbortSignal.timeout(ENGINE_TIMEOUT_MS),
      });
    };

    let res = await call('web_search');
    // Older accounts/models only accept the preview tool name.
    if (res.status === 400) {
      const body = await res.clone().text();
      if (/web_search/.test(body)) res = await call('web_search_preview');
    }
    if (!res.ok) throw new Error(`OpenAI ${await failText(res)}`);
    return parseOpenAIResponses(await res.json());
  }
}

export function parseOpenAIResponses(data: any): EngineAnswer {
  const parts: string[] = [];
  const sources = [];
  for (const item of Array.isArray(data?.output) ? data.output : []) {
    if (item?.type !== 'message') continue;
    for (const c of Array.isArray(item.content) ? item.content : []) {
      if (c?.type !== 'output_text') continue;
      parts.push(c.text || '');
      for (const a of Array.isArray(c.annotations) ? c.annotations : []) {
        if (a?.type === 'url_citation' && a.url) sources.push(toSource(cleanUtm(a.url), a.title));
      }
    }
  }
  const text = parts.join('\n').trim() || String(data?.output_text || '');
  return { text, sources: dedupeSources(sources) };
}

/** OpenAI appends ?utm_source=openai to cited links. */
function cleanUtm(url: string): string {
  try {
    const u = new URL(url);
    if (u.searchParams.get('utm_source') === 'openai') u.searchParams.delete('utm_source');
    return u.toString();
  } catch {
    return url;
  }
}
