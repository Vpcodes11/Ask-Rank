export type EngineId = 'perplexity' | 'openai_search' | 'gemini_grounding';

export interface BuyerPrompt {
  id: string;
  query: string;
  category: 'intent_buy' | 'comparison' | 'budget' | 'spec' | 'gift_occasion';
  intent: string;
}

export interface EngineSource {
  title: string;
  url: string;
  domain: string;
}

export interface EngineCompetitor {
  name: string;
  rank?: number;
}

export interface PromptRunResult {
  id: string;
  prompt_id: string;
  prompt: string;
  engine: EngineId;
  engine_name: string;
  /** The store's brand appears in the answer text */
  mentioned: boolean;
  /** The store's own site is among the cited sources */
  cited: boolean;
  mentioned_products: string[];
  /** 1 = first brand recommended. null = not recommended / not in the ranked list */
  position: number | null;
  competitors: EngineCompetitor[];
  sources: EngineSource[];
  raw_response: string;
  error?: string;
  run_at: string;
}

export interface ScanBreakdown {
  mention_rate: number; // % of answers naming the brand
  avg_position: number | null; // average rank when named
  engine_diversity: number; // % of engines that named the brand at least once
  citation_rate: number; // % of answers citing the store's own site
}

export interface CompetitorStats {
  name: string;
  mentionCount: number;
  percentage: number;
  avgPosition: number | null;
}

export interface CitationSourceStats {
  domain: string;
  url: string;
  frequency: number;
  tier: 'Media & editorial' | 'Community & forums' | 'Marketplace' | 'Video' | 'Brand site' | 'Other';
}

export interface StoreProduct {
  title: string;
  handle: string;
  description: string;
  price: string;
  url: string;
  imageUrl?: string;
  tags: string[];
}

export interface StoreSnapshot {
  domain: string;
  storeName: string;
  homepageTitle: string;
  homepageDescription: string;
  isShopify: boolean;
  productsJsonFound: boolean;
  sitemapFound: boolean;
  llmsTxtFound: boolean;
  products: StoreProduct[];
  homepageJsonLdTypes: string[];
  currency: string;
}

/** Scan as sent to the browser (locked prompts have their results removed on the server). */
export interface ScanView {
  id: string;
  slug: string;
  url: string;
  domain: string;
  storeName: string;
  niche: string;
  status: 'running' | 'done' | 'failed';
  progress: string | null;
  error: string | null;
  kind: string;
  score: number | null;
  breakdown: ScanBreakdown | null;
  prompts: BuyerPrompt[];
  results: PromptRunResult[];
  competitors: CompetitorStats[];
  sources: CitationSourceStats[];
  engines: EngineId[];
  unlocked: boolean;
  /** Can see the paid Deep Audit section */
  deepAccess: boolean;
  /** Prompts whose results are visible */
  visiblePromptIds: string[];
  createdAt: string;
  finishedAt: string | null;
}

export interface ProductAudit {
  title: string;
  url: string;
  fetched: boolean;
  hasProductSchema: boolean;
  hasOffer: boolean;
  hasPrice: boolean;
  hasAvailability: boolean;
  hasBrand: boolean;
  hasGtinOrSku: boolean;
  hasAggregateRating: boolean;
  ratingIssue: string | null;
  hasFaqSchema: boolean;
  descriptionWords: number;
  gaps: string[];
  gapScore: number; // 0-100, higher = more missing
}

export interface DeepAudit {
  generatedAt: string;
  products: ProductAudit[];
  site: {
    hasOrganizationSchema: boolean;
    hasLlmsTxt: boolean;
    hasSitemap: boolean;
    productsJsonPublic: boolean;
  };
  citationTargets: Array<{ domain: string; url: string; competitorsNamed: string[]; count: number }>;
  recommendations: string[];
}
