import { EngineRegistry, AIEngineAdapter } from './base';
import { PerplexityEngineAdapter } from './perplexity';
import { OpenAISearchEngineAdapter } from './openai-search';
import { GeminiGroundingEngineAdapter } from './gemini-grounding';
import { GoogleAIOverviewsEngineAdapter } from './google-aio';

// Register built-in engines
const perplexity = new PerplexityEngineAdapter();
const openai = new OpenAISearchEngineAdapter();
const gemini = new GeminiGroundingEngineAdapter();
const googleAio = new GoogleAIOverviewsEngineAdapter();

EngineRegistry.register(perplexity);
EngineRegistry.register(openai);
EngineRegistry.register(gemini);
EngineRegistry.register(googleAio);

export {
  EngineRegistry,
  type AIEngineAdapter,
  PerplexityEngineAdapter,
  OpenAISearchEngineAdapter,
  GeminiGroundingEngineAdapter,
  GoogleAIOverviewsEngineAdapter
};
