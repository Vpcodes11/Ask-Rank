export type EngineId = 'perplexity' | 'openai_search' | 'gemini_grounding' | 'google_aio';

export interface BuyerPrompt {
  id: string;
  query: string;
  category: 'intent_buy' | 'comparison' | 'budget' | 'ingredient_spec' | 'gift_occasion';
  intent: string;
  volume_estimate: 'High' | 'Medium' | 'Trending';
}

export interface EngineSource {
  title: string;
  url: string;
  domain: string;
}

export interface EngineCompetitor {
  name: string;
  rank?: number;
  snippet?: string;
}

export interface PromptRunResult {
  id: string;
  prompt_id: string;
  prompt: string;
  engine: EngineId;
  engine_name: string;
  mentioned: boolean;
  product_mentioned: boolean;
  mentioned_products: string[];
  position: number | null; // 1 = first brand recommended, 2 = second, null = not recommended
  competitors: EngineCompetitor[];
  sources: EngineSource[];
  raw_response: string;
  run_at: string;
}

export interface ScanBreakdown {
  mention_rate: number; // 0 - 100
  avg_position: number; // e.g. 1.8 or null
  engine_diversity: number; // 0 - 100
  source_authority: number; // 0 - 100
}

export interface CompetitorStats {
  name: string;
  mentionCount: number;
  percentage: number;
  avgPosition: number;
}

export interface CitationSourceStats {
  domain: string;
  url: string;
  frequency: number;
  authority_tier: 'Top Tier (PR/Media)' | 'Community (Reddit/Forums)' | 'Niche Blog' | 'Marketplace';
}

export interface ScanRecord {
  id: string;
  url: string;
  clean_domain: string;
  store_name: string;
  niche: string;
  email: string | null;
  score: number; // 0 - 100
  breakdown: ScanBreakdown;
  prompts: BuyerPrompt[];
  results: PromptRunResult[];
  competitors_found: CompetitorStats[];
  top_sources: CitationSourceStats[];
  share_slug: string;
  unlocked: boolean;
  created_at: string;
}

export interface ShopifyProduct {
  id: string;
  store_id: string;
  shopify_product_id: string;
  title: string;
  handle: string;
  description: string;
  price: string;
  image_url: string;
  tags: string[];
  schema_data: {
    has_product_schema: boolean;
    has_offer_schema: boolean;
    has_aggregate_rating: boolean;
    rating_valid: boolean;
    rating_warning?: string;
    has_org_schema: boolean;
    has_faq_schema: boolean;
    raw_json_ld?: any;
  };
  content_gap_score: number; // 0 - 100 (higher = worse gap)
  content_gaps: {
    missing_specs: boolean;
    missing_use_cases: boolean;
    missing_comparisons: boolean;
    missing_materials: boolean;
    missing_sizing: boolean;
    missing_faqs: boolean;
  };
  created_at: string;
}

export interface StoreRecord {
  id: string;
  user_id: string;
  shopify_domain: string;
  store_name: string;
  access_token: string;
  currency: string;
  status: 'connected' | 'syncing' | 'synced' | 'error';
  plan: 'free' | 'report' | 'monitor' | 'agency';
  last_synced_at: string | null;
  product_count: number;
  avg_gap_score: number;
  created_at: string;
}

export interface ContentSuggestion {
  id: string;
  product_id: string;
  store_id: string;
  product_title: string;
  type: 'description' | 'faqs' | 'specs' | 'comparisons' | 'schema' | 'llms_txt' | 'about_page';
  before_content: string;
  after_content: string;
  diff_summary: string;
  status: 'pending' | 'approved' | 'rejected' | 'synced';
  created_at: string;
  approved_at?: string;
}

export interface PromptSetRecord {
  id: string;
  store_id: string;
  name: string;
  niche: string;
  prompts: string[];
  active: boolean;
  frequency: 'weekly' | 'daily';
  last_run_at: string | null;
  created_at: string;
}

export interface SubscriptionRecord {
  id: string;
  store_id: string;
  user_id: string;
  plan: 'free' | 'report' | 'monitor' | 'agency';
  status: 'active' | 'canceled' | 'past_due';
  interval: 'one_time' | 'monthly';
  currency: 'USD' | 'INR';
  amount: number;
  current_period_end: string;
  created_at: string;
}

export interface CitationOpportunity {
  id: string;
  store_id: string;
  domain: string;
  url: string;
  competitors_cited: string[];
  citation_count: number;
  authority_score: number;
  opportunity_type: 'editorial_roundup' | 'reddit_discussion' | 'comparison_review' | 'forum_recommendation';
  pitch_angle: string;
  action_status: 'open' | 'in_progress' | 'pitch_sent' | 'won';
}

export interface TrackingPoint {
  date: string;
  overallScore: number;
  perplexityScore: number;
  chatgptScore: number;
  geminiScore: number;
  googleAioScore: number;
}
