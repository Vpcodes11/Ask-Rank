/**
 * Plain (non-search) LLM calls used for: writing buyer prompts, reading engine answers
 * into structured data, and writing product content fixes.
 * Uses whichever key is configured: OpenAI, then Gemini.
 */

export type LlmProvider = 'openai' | 'gemini';

export function llmProvider(): LlmProvider | null {
  if (process.env.OPENAI_API_KEY) return 'openai';
  if (process.env.GEMINI_API_KEY) return 'gemini';
  return null;
}

const TIMEOUT_MS = 45_000;

/** Asks the model for JSON and parses it. Throws when no provider is configured or the reply is not JSON. */
export async function generateJson<T = unknown>(system: string, user: string, opts: { maxTokens?: number } = {}): Promise<T> {
  const provider = llmProvider();
  if (!provider) throw new Error('No LLM configured: set OPENAI_API_KEY or GEMINI_API_KEY');
  const text = provider === 'openai' ? await openaiJson(system, user, opts.maxTokens) : await geminiJson(system, user, opts.maxTokens);
  return parseJsonLoose<T>(text);
}

export function parseJsonLoose<T>(text: string): T {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const start = cleaned.search(/[[{]/);
    const end = Math.max(cleaned.lastIndexOf('}'), cleaned.lastIndexOf(']'));
    if (start >= 0 && end > start) return JSON.parse(cleaned.slice(start, end + 1)) as T;
    throw new Error('Model reply was not JSON');
  }
}

async function openaiJson(system: string, user: string, maxTokens = 2000): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: process.env.OPENAI_TEXT_MODEL || 'gpt-4.1-mini',
      response_format: { type: 'json_object' },
      max_tokens: maxTokens,
      temperature: 0.2,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

async function geminiJson(system: string, user: string, maxTokens = 2000): Promise<string> {
  const model = process.env.GEMINI_TEXT_MODEL || 'gemini-2.5-flash';
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': String(process.env.GEMINI_API_KEY) },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: 'user', parts: [{ text: user }] }],
      generationConfig: { responseMimeType: 'application/json', maxOutputTokens: maxTokens, temperature: 0.2 },
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = await res.json();
  return (data.candidates?.[0]?.content?.parts || []).map((p: { text?: string }) => p.text || '').join('');
}
