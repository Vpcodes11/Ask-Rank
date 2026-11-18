import fs from 'fs';
import path from 'path';
import {
  ScanRecord,
  StoreRecord,
  ShopifyProduct,
  PromptSetRecord,
  PromptRunResult,
  ContentSuggestion,
  SubscriptionRecord,
  CitationOpportunity,
  TrackingPoint
} from './types';

interface DatabaseSchema {
  scans: ScanRecord[];
  stores: StoreRecord[];
  products: ShopifyProduct[];
  prompt_sets: PromptSetRecord[];
  prompt_runs: PromptRunResult[];
  content_suggestions: ContentSuggestion[];
  subscriptions: SubscriptionRecord[];
  citation_opportunities: CitationOpportunity[];
  tracking_history: Record<string, TrackingPoint[]>; // store_id -> array of points
}

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'askrank.db.json');

class DatabaseService {
  private data: DatabaseSchema;
  private lastMtime: number = 0;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const stats = fs.statSync(DB_FILE);
        this.lastMtime = stats.mtimeMs;
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      } catch (err) {
        console.error('Failed to parse database file, resetting with seed data:', err);
      }
    }

    const initial = this.generateSeedData();
    this.saveData(initial);
    return initial;
  }

  private refresh(): void {
    try {
      if (fs.existsSync(DB_FILE)) {
        const stats = fs.statSync(DB_FILE);
        if (stats.mtimeMs > this.lastMtime) {
          const raw = fs.readFileSync(DB_FILE, 'utf-8');
          this.data = JSON.parse(raw);
          this.lastMtime = stats.mtimeMs;
        }
      }
    } catch (err) {
      // ignore
    }
  }

  private saveData(data: DatabaseSchema): void {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    try {
      this.lastMtime = fs.statSync(DB_FILE).mtimeMs;
    } catch {}
  }

  public persist(): void {
    this.saveData(this.data);
  }

  // --- SCANS ---
  public getScans(): ScanRecord[] {
    this.refresh();
    return this.data.scans;
  }

  public getScanById(id: string): ScanRecord | undefined {
    this.refresh();
    return this.data.scans.find(s => s.id === id || s.share_slug === id);
  }

  public createScan(scan: ScanRecord): ScanRecord {
    this.refresh();
    this.data.scans.unshift(scan);
    this.persist();
    return scan;
  }

  public updateScan(id: string, updates: Partial<ScanRecord>): ScanRecord | undefined {
    this.refresh();
    const idx = this.data.scans.findIndex(s => s.id === id || s.share_slug === id);
    if (idx === -1) return undefined;
    this.data.scans[idx] = { ...this.data.scans[idx], ...updates };
    this.persist();
    return this.data.scans[idx];
  }

  // --- STORES ---
  public getStores(): StoreRecord[] {
    this.refresh();
    return this.data.stores;
  }

  public getStoreById(id: string): StoreRecord | undefined {
    this.refresh();
    return this.data.stores.find(s => s.id === id);
  }

  public createStore(store: StoreRecord): StoreRecord {
    this.refresh();
    this.data.stores.unshift(store);
    this.persist();
    return store;
  }

  public updateStore(id: string, updates: Partial<StoreRecord>): StoreRecord | undefined {
    this.refresh();
    const idx = this.data.stores.findIndex(s => s.id === id);
    if (idx === -1) return undefined;
    this.data.stores[idx] = { ...this.data.stores[idx], ...updates };
    this.persist();
    return this.data.stores[idx];
  }

  // --- PRODUCTS ---
  public getProducts(storeId?: string): ShopifyProduct[] {
    this.refresh();
    if (storeId) {
      return this.data.products.filter(p => p.store_id === storeId);
    }
    return this.data.products;
  }

  public getProductById(id: string): ShopifyProduct | undefined {
    this.refresh();
    return this.data.products.find(p => p.id === id);
  }

  public createProduct(product: ShopifyProduct): ShopifyProduct {
    this.refresh();
    this.data.products.push(product);
    this.persist();
    return product;
  }

  public updateProduct(id: string, updates: Partial<ShopifyProduct>): ShopifyProduct | undefined {
    this.refresh();
    const idx = this.data.products.findIndex(p => p.id === id);
    if (idx === -1) return undefined;
    this.data.products[idx] = { ...this.data.products[idx], ...updates };
    this.persist();
    return this.data.products[idx];
  }

  // --- PROMPT SETS & RUNS ---
  public getPromptSets(storeId: string): PromptSetRecord[] {
    this.refresh();
    return this.data.prompt_sets.filter(ps => ps.store_id === storeId);
  }

  public createPromptSet(promptSet: PromptSetRecord): PromptSetRecord {
    this.refresh();
    this.data.prompt_sets.push(promptSet);
    this.persist();
    return promptSet;
  }

  public getPromptRuns(promptSetId: string): PromptRunResult[] {
    this.refresh();
    return this.data.prompt_runs.filter(pr => pr.prompt_id.startsWith(promptSetId));
  }

  public createPromptRun(run: PromptRunResult): PromptRunResult {
    this.refresh();
    this.data.prompt_runs.push(run);
    this.persist();
    return run;
  }

  // --- CONTENT SUGGESTIONS ---
  public getContentSuggestions(storeId?: string): ContentSuggestion[] {
    this.refresh();
    if (storeId) {
      return this.data.content_suggestions.filter(c => c.store_id === storeId);
    }
    return this.data.content_suggestions;
  }

  public updateContentSuggestion(id: string, updates: Partial<ContentSuggestion>): ContentSuggestion | undefined {
    this.refresh();
    const idx = this.data.content_suggestions.findIndex(c => c.id === id);
    if (idx === -1) return undefined;
    this.data.content_suggestions[idx] = {
      ...this.data.content_suggestions[idx],
      ...updates,
      approved_at: (updates.status === 'approved' || updates.status === 'synced')
        ? (this.data.content_suggestions[idx].approved_at || new Date().toISOString())
        : this.data.content_suggestions[idx].approved_at
    };
    this.persist();
    return this.data.content_suggestions[idx];
  }

  public addContentSuggestion(suggestion: ContentSuggestion): ContentSuggestion {
    this.refresh();
    this.data.content_suggestions.unshift(suggestion);
    this.persist();
    return suggestion;
  }

  // --- SUBSCRIPTIONS ---
  public getSubscriptions(storeId?: string): SubscriptionRecord[] {
    this.refresh();
    if (storeId) {
      return this.data.subscriptions.filter(s => s.store_id === storeId);
    }
    return this.data.subscriptions;
  }

  public setSubscription(sub: SubscriptionRecord): SubscriptionRecord {
    this.refresh();
    const idx = this.data.subscriptions.findIndex(s => s.store_id === sub.store_id);
    if (idx !== -1) {
      this.data.subscriptions[idx] = sub;
    } else {
      this.data.subscriptions.push(sub);
    }
    // Also update store plan
    this.updateStore(sub.store_id, { plan: sub.plan });
    this.persist();
    return sub;
  }

  // --- CITATION OPPORTUNITIES ---
  public getCitationOpportunities(storeId?: string): CitationOpportunity[] {
    this.refresh();
    if (storeId) {
      return this.data.citation_opportunities.filter(c => c.store_id === storeId);
    }
    return this.data.citation_opportunities;
  }

  public updateCitationOpportunity(id: string, updates: Partial<CitationOpportunity>): CitationOpportunity | undefined {
    this.refresh();
    const idx = this.data.citation_opportunities.findIndex(c => c.id === id);
    if (idx === -1) return undefined;
    this.data.citation_opportunities[idx] = { ...this.data.citation_opportunities[idx], ...updates };
    this.persist();
    return this.data.citation_opportunities[idx];
  }

  // --- TRACKING HISTORY ---
  public getTrackingHistory(storeId: string): TrackingPoint[] {
    this.refresh();
    return this.data.tracking_history[storeId] || [
      { date: '4 Weeks Ago', overallScore: 28, perplexityScore: 22, chatgptScore: 25, geminiScore: 32, googleAioScore: 33 },
      { date: '3 Weeks Ago', overallScore: 35, perplexityScore: 30, chatgptScore: 32, geminiScore: 40, googleAioScore: 38 },
      { date: '2 Weeks Ago', overallScore: 48, perplexityScore: 45, chatgptScore: 44, geminiScore: 52, googleAioScore: 50 },
      { date: 'Last Week', overallScore: 61, perplexityScore: 58, chatgptScore: 60, geminiScore: 65, googleAioScore: 62 },
      { date: 'Today', overallScore: 74, perplexityScore: 71, chatgptScore: 75, geminiScore: 78, googleAioScore: 72 },
    ];
  }

  public addTrackingPoint(storeId: string, point: TrackingPoint): void {
    this.refresh();
    if (!this.data.tracking_history[storeId]) {
      this.data.tracking_history[storeId] = [];
    }
    this.data.tracking_history[storeId].push(point);
    this.persist();
  }

  // --- SEED DATA BUILDER ---
  private generateSeedData(): DatabaseSchema {
    const defaultStoreId = 'store-demo-blissclub';
    const store: StoreRecord = {
      id: defaultStoreId,
      user_id: 'user-seller-01',
      shopify_domain: 'blissclub-demo.myshopify.com',
      store_name: 'BlissClub Activewear',
      access_token: 'shpat_live_demo_token_xyz987',
      currency: 'INR',
      status: 'synced',
      plan: 'monitor',
      last_synced_at: new Date().toISOString(),
      product_count: 3,
      avg_gap_score: 64,
      created_at: new Date(Date.now() - 30 * 86400000).toISOString()
    };

    const products: ShopifyProduct[] = [
      {
        id: 'prod-bliss-1',
        store_id: defaultStoreId,
        shopify_product_id: 'gid://shopify/Product/8472910291',
        title: 'The Ultimate Flare Pants with Deep Pockets',
        handle: 'the-ultimate-flare-pants',
        description: 'Super soft, buttery fabric. Great for yoga and relaxing at home.',
        price: '1999',
        image_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&auto=format&fit=crop&q=80',
        tags: ['flare pants', 'yoga', 'loungewear', 'pockets', 'activewear'],
        schema_data: {
          has_product_schema: true,
          has_offer_schema: true,
          has_aggregate_rating: false,
          rating_valid: false,
          rating_warning: 'Missing genuine reviewCount and AggregateRating. LLMs cannot verify social proof.',
          has_org_schema: true,
          has_faq_schema: false,
        },
        content_gap_score: 72,
        content_gaps: {
          missing_specs: true,
          missing_use_cases: true,
          missing_comparisons: true,
          missing_materials: false,
          missing_sizing: true,
          missing_faqs: true,
        },
        created_at: new Date().toISOString()
      },
      {
        id: 'prod-bliss-2',
        store_id: defaultStoreId,
        shopify_product_id: 'gid://shopify/Product/8472910292',
        title: 'MoveFree High-Impact Running Sports Bra',
        handle: 'movefree-high-impact-bra',
        description: 'Padded running sports bra. Moisture wicking.',
        price: '1499',
        image_url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&auto=format&fit=crop&q=80',
        tags: ['sports bra', 'running', 'high impact'],
        schema_data: {
          has_product_schema: true,
          has_offer_schema: true,
          has_aggregate_rating: true,
          rating_valid: true,
          has_org_schema: true,
          has_faq_schema: false,
        },
        content_gap_score: 58,
        content_gaps: {
          missing_specs: true,
          missing_use_cases: false,
          missing_comparisons: true,
          missing_materials: false,
          missing_sizing: true,
          missing_faqs: true,
        },
        created_at: new Date().toISOString()
      },
      {
        id: 'prod-bliss-3',
        store_id: defaultStoreId,
        shopify_product_id: 'gid://shopify/Product/8472910293',
        title: 'AirMesh Cooling Workout Tank Top',
        handle: 'airmesh-cooling-tank',
        description: 'Lightweight sleeveless top for workouts.',
        price: '899',
        image_url: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=600&auto=format&fit=crop&q=80',
        tags: ['tank', 'cooling', 'gym'],
        schema_data: {
          has_product_schema: false,
          has_offer_schema: false,
          has_aggregate_rating: false,
          rating_valid: false,
          rating_warning: 'No Schema.org Product markup detected. AI scrapers see this page as raw text.',
          has_org_schema: false,
          has_faq_schema: false,
        },
        content_gap_score: 85,
        content_gaps: {
          missing_specs: true,
          missing_use_cases: true,
          missing_comparisons: true,
          missing_materials: true,
          missing_sizing: true,
          missing_faqs: true,
        },
        created_at: new Date().toISOString()
      }
    ];

    const contentSuggestions: ContentSuggestion[] = [
      {
        id: 'sugg-1',
        product_id: 'prod-bliss-1',
        store_id: defaultStoreId,
        product_title: 'The Ultimate Flare Pants with Deep Pockets',
        type: 'description',
        before_content: 'Super soft, buttery fabric. Great for yoga and relaxing at home.',
        after_content: `**Engineered for 16-Hour Comfort & Active Versatility**\n\nCrafted from our signature 4-way stretch CloudFlex™ fabric (82% Micro-Polyester, 18% Spandex), the Ultimate Flare Pants deliver zero-compression waist ease without rolling down during workouts.\n\n### Key Specifications:\n- **Waistband**: 4.5" ultra-wide high-rise contoured band (anti-slip guarantee)\n- **Storage**: 2 deep 7" side utility pockets (holds iPhone 16 Pro Max securely)\n- **Inseam Lengths**: Petite (29"), Regular (31"), Tall (33")\n- **Opacity**: 100% squat-proof tested under studio halogen lights\n\n### Ideal For:\n- Studio Pilates & Vinyasa Yoga\n- Airport Travel & Remote Work Lounging\n- Brisk Walking & Daily Errands\n\n### How It Compares vs Lululemon Groove:\nOffers identical buttery feel and flare silhouette at 1/4th the price with enhanced pocket depth tailored for larger smartphones.`,
        diff_summary: 'Added technical fabric specs, exact pocket dimensions, height sizing guides, and competitor comparison vs Lululemon.',
        status: 'pending',
        created_at: new Date().toISOString()
      },
      {
        id: 'sugg-2',
        product_id: 'prod-bliss-1',
        store_id: defaultStoreId,
        product_title: 'The Ultimate Flare Pants with Deep Pockets',
        type: 'faqs',
        before_content: 'No buyer FAQs found on product page.',
        after_content: `### Frequently Asked Questions (Structured JSON-LD FAQPage):\n\n**Q: Do these flare pants roll down at the waist when bending or squatting?**\n*A: No. Our 4.5-inch waistband features dual-lock elastic ribbing that stays flat against your core without digging or folding.*\n\n**Q: Will an iPhone 15 or 16 Pro Max fit in the side pockets without falling out?**\n*A: Yes. Both side pockets are 7 inches deep and angled so your device stays snug against your hip even while jogging.*\n\n**Q: How do I wash them to prevent pilling?**\n*A: Machine wash cold on delicate inside out with like colors. Tumble dry low or air dry in shade. Avoid fabric softeners.*`,
        diff_summary: 'Created 3 high-intent FAQ blocks targeting common conversational AI queries.',
        status: 'pending',
        created_at: new Date().toISOString()
      },
      {
        id: 'sugg-3',
        product_id: 'prod-bliss-3',
        store_id: defaultStoreId,
        product_title: 'AirMesh Cooling Workout Tank Top',
        type: 'schema',
        before_content: '<!-- Missing Schema.org markup -->',
        after_content: `<script type="application/ld+json">
{
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": "AirMesh Cooling Workout Tank Top",
  "image": "https://images.unsplash.com/photo-1571902943202-507ec2618e8f",
  "description": "Ultra-lightweight moisture-wicking sleeveless workout tank with antibacterial silver-ion treatment.",
  "brand": {
    "@type": "Brand",
    "name": "BlissClub"
  },
  "offers": {
    "@type": "Offer",
    "url": "https://blissclub.com/products/airmesh-cooling-tank",
    "priceCurrency": "INR",
    "price": "899",
    "availability": "https://schema.org/InStock",
    "itemCondition": "https://schema.org/NewCondition"
  }
}
</script>`,
        diff_summary: 'Generated complete Schema.org Product & Offer JSON-LD tag for Google Search & AI crawl bot indexation.',
        status: 'pending',
        created_at: new Date().toISOString()
      }
    ];

    const citationOpportunities: CitationOpportunity[] = [
      {
        id: 'cite-opp-1',
        store_id: defaultStoreId,
        domain: 'reddit.com/r/xxfitness',
        url: 'https://reddit.com/r/xxfitness/comments/indian_activewear_reviews',
        competitors_cited: ['Gymshark', 'Lululemon', 'Kica Active'],
        citation_count: 14,
        authority_score: 94,
        opportunity_type: 'reddit_discussion',
        pitch_angle: 'Participate in community AMA or seed authentic founder comparison on fabric durability.',
        action_status: 'open'
      },
      {
        id: 'cite-opp-2',
        store_id: defaultStoreId,
        domain: 'vogue.in',
        url: 'https://vogue.in/fashion/content/best-homegrown-indian-athleisure-brands',
        competitors_cited: ['BlissClub', 'Kica', 'Cultsport'],
        citation_count: 8,
        authority_score: 88,
        opportunity_type: 'editorial_roundup',
        pitch_angle: 'Pitch Vogue fashion editor for upcoming "Monsoon Travel Essentials" editorial inclusion.',
        action_status: 'in_progress'
      },
      {
        id: 'cite-opp-3',
        store_id: defaultStoreId,
        domain: 'gqindia.com',
        url: 'https://gqindia.com/look-good/fitness-gear-roundup',
        competitors_cited: ['Nike', 'Under Armour', 'Gymshark'],
        citation_count: 6,
        authority_score: 85,
        opportunity_type: 'editorial_roundup',
        pitch_angle: 'Send product samples to lifestyle reviewers for performance testing against global brands.',
        action_status: 'open'
      },
      {
        id: 'cite-opp-4',
        store_id: defaultStoreId,
        domain: 'fitreviewhub.com',
        url: 'https://fitreviewhub.com/reviews/best-squat-proof-leggings',
        competitors_cited: ['Lululemon Align', 'Gymshark Flex'],
        citation_count: 5,
        authority_score: 62,
        opportunity_type: 'comparison_review',
        pitch_angle: 'Request dedicated product review with side-by-side opacity opacity & squat stretch test.',
        action_status: 'open'
      }
    ];

    const subscriptions: SubscriptionRecord[] = [
      {
        id: 'sub-bliss-1',
        store_id: defaultStoreId,
        user_id: 'user-seller-01',
        plan: 'monitor',
        status: 'active',
        interval: 'monthly',
        currency: 'INR',
        amount: 1999,
        current_period_end: new Date(Date.now() + 25 * 86400000).toISOString(),
        created_at: new Date(Date.now() - 5 * 86400000).toISOString()
      }
    ];

    return {
      scans: [],
      stores: [store],
      products,
      prompt_sets: [],
      prompt_runs: [],
      content_suggestions: contentSuggestions,
      subscriptions,
      citation_opportunities: citationOpportunities,
      tracking_history: {
        [defaultStoreId]: [
          { date: 'Oct 20', overallScore: 28, perplexityScore: 24, chatgptScore: 22, geminiScore: 34, googleAioScore: 32 },
          { date: 'Oct 27', overallScore: 38, perplexityScore: 35, chatgptScore: 33, geminiScore: 42, googleAioScore: 40 },
          { date: 'Nov 03', overallScore: 52, perplexityScore: 49, chatgptScore: 48, geminiScore: 56, googleAioScore: 54 },
          { date: 'Nov 10', overallScore: 65, perplexityScore: 62, chatgptScore: 63, geminiScore: 69, googleAioScore: 66 },
          { date: 'Nov 17', overallScore: 78, perplexityScore: 75, chatgptScore: 76, geminiScore: 82, googleAioScore: 79 },
        ]
      }
    };
  }
}

export const db = new DatabaseService();
