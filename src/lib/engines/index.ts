import type { AIEngine } from './base';
import type { EngineId } from '../types';
import { PerplexityEngine } from './perplexity';
import { OpenAISearchEngine } from './openai-search';
import { GeminiGroundingEngine } from './gemini-grounding';

export const ALL_ENGINES: AIEngine[] = [new OpenAISearchEngine(), new PerplexityEngine(), new GeminiGroundingEngine()];

export const ENGINE_NAMES: Record<EngineId, string> = {
  openai_search: 'ChatGPT Search',
  perplexity: 'Perplexity',
  gemini_grounding: 'Gemini',
};

/**
 * Engines with an API key set. ENABLED_ENGINES (comma list of ids) can switch some off,
 * e.g. to control cost. There is no simulated fallback: no key, no engine.
 */
export function activeEngines(): AIEngine[] {
  const allow = (process.env.ENABLED_ENGINES || '').split(',').map((s) => s.trim()).filter(Boolean);
  return ALL_ENGINES.filter((e) => e.isConfigured() && (allow.length === 0 || allow.includes(e.id)));
}

export type { AIEngine, EngineAnswer } from './base';
