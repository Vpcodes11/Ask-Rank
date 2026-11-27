import { AIEngine, EngineAnswer, ENGINE_TIMEOUT_MS, dedupeSources, failText } from './base';
import type { EngineSource } from '../types';

/**
 * Gemini with Grounding with Google Search.
 * Docs: https://ai.google.dev/gemini-api/docs/google-search
 */
export class GeminiGroundingEngine implements AIEngine {
  id = 'gemini_grounding' as const;
  name = 'Gemini';

  isConfigured() {
    return Boolean(process.env.GEMINI_API_KEY);
  }

  async ask(prompt: string): Promise<EngineAnswer> {
    const model = process.env.GEMINI_SEARCH_MODEL || 'gemini-2.5-flash';
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': String(process.env.GEMINI_API_KEY) },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        tools: [{ google_search: {} }],
      }),
      signal: AbortSignal.timeout(ENGINE_TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`Gemini ${await failText(res)}`);
    return parseGemini(await res.json());
  }
}

export function parseGemini(data: any): EngineAnswer {
  const cand = data?.candidates?.[0];
  const text = (cand?.content?.parts || []).map((p: { text?: string }) => p.text || '').join('').trim();
  const chunks: Array<{ web?: { uri?: string; title?: string; domain?: string } }> = cand?.groundingMetadata?.groundingChunks || [];
  // Grounding links are Google redirect URLs. The source site is in `web.domain`
  // (newer responses) or the chunk title (older ones), never in the redirect URL.
  const sources: Array<EngineSource | null> = chunks.map((c) => {
    const uri = c.web?.uri;
    const title = (c.web?.title || '').trim().toLowerCase();
    if (!uri) return null;
    const given = (c.web?.domain || '').trim().toLowerCase().replace(/^www\./, '');
    const domain = given || (/^[a-z0-9.-]+\.[a-z]{2,}$/.test(title) ? title.replace(/^www\./, '') : safeHost(uri));
    return domain ? { url: uri, title: c.web?.title || domain, domain } : null;
  });
  return { text, sources: dedupeSources(sources) };
}

function safeHost(u: string): string {
  try {
    return new URL(u).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}
