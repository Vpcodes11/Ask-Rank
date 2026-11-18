import { EngineId, EngineSource, EngineCompetitor } from '../types';

export interface EngineContext {
  brandName: string;
  storeUrl: string;
  niche: string;
  sampleProducts?: Array<{ title: string; price?: string }>;
}

export interface EngineRunOutput {
  mentioned: boolean;
  productMentioned: boolean;
  mentionedProducts: string[];
  position: number | null;
  competitors: EngineCompetitor[];
  sources: EngineSource[];
  rawResponse: string;
}

export interface AIEngineAdapter {
  id: EngineId;
  name: string;
  provider: string;
  description: string;
  badgeColor: string;
  isLiveSupported: boolean;
  isConfigured(): boolean;
  query(prompt: string, context: EngineContext): Promise<EngineRunOutput>;
}

export class EngineRegistry {
  private static engines: Map<EngineId, AIEngineAdapter> = new Map();

  public static register(engine: AIEngineAdapter): void {
    this.engines.set(engine.id, engine);
  }

  public static get(id: EngineId): AIEngineAdapter | undefined {
    return this.engines.get(id);
  }

  public static getAll(): AIEngineAdapter[] {
    return Array.from(this.engines.values());
  }

  public static getActiveEngines(): AIEngineAdapter[] {
    return Array.from(this.engines.values());
  }
}
