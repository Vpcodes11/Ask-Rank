# AskRank 🚀
### Generative Engine Optimization (GEO) & AI Visibility for Shopify Stores

AskRank benchmarks whether conversational AI assistants (**ChatGPT Search, Perplexity Sonar, Google Gemini Grounding, Google AI Overviews**) recommend Shopify products, identifies product data gaps, and enriches store catalogs with seller-approved content fixes.

---

## 🌟 Key Features

### 1. Instant Free Scan (No Login Required)
- **Store Crawl**: Ingests public pages, `https://<store>/products.json`, and `/sitemap.xml`.
- **10 Buyer Queries**: Synthesizes realistic commercial prompts (e.g. *"best organic face serum under ₹1000 in India"*, *"squat-proof leggings with deep pockets"*).
- **Pluggable AI Search Grounding**: Queries Perplexity Sonar, ChatGPT Search, Gemini Grounding, and Google AI Overviews.
- **AI Visibility Score (0–100)**: Evaluates Mention Rate (40%), Avg Recommendation Position (25%), Citation Authority (20%), and Engine Diversity (15%).
- **Shareable Result Card (OG Image)**: Live SVG scorecard badge (`/api/og/[id]`) for Twitter, LinkedIn, and social sharing.
- **Gated Email Report**: Displays 3 prompts for free; blurs the remaining 7 until unlocked with work email.

### 2. Connected Store & Deep Audit (Paid)
- **Structured Data (JSON-LD) Check**:
  - `Product` & `Offer` schema validation
  - **Strict Review Guard**: Audits `AggregateRating` — flags penalizable 5.0-star schemas that lack genuine `reviewCount`
  - `Organization` & `FAQPage` schemas
  - 1-Click JSON-LD code generator for Shopify themes
- **Product Content Gaps**: Scans for missing technical specifications, target use cases, competitor comparisons, materials, sizing, and shopper FAQs.
- **AI Content Fixer (Human in the Loop)**: AI generates enriched descriptions and FAQ blocks. **Never auto-publishes**: sellers review side-by-side diffs and click *"Approve & Write to Shopify"*.
- **Machine-Readable Indexing**: Generates `/llms.txt` and an AI-optimized About/Brand page for AI web crawlers.
- **Competitor Citation Map**: Pinpoints Reddit threads, Vogue roundups, and Wirecutter reviews where competitors get cited, complete with actionable PR pitch angles.

### 3. Weekly Tracking & Automation
- **Scheduled Prompt Set Rerun (Cron)**: Automated weekly execution testing 50 commercial queries.
- **Historical Score Trajectory**: Multi-week visual progression charting AI Visibility gains.
- **Founder Weekly Digest**: Automated briefing email with ranking gains and competitor wins.

### 4. Pricing & Currency Localization
- **Free Scan**: 3 prompts visible, 7 blurred, OG share card
- **Deep Audit Report**: $19 / ₹1,499 (one-time)
- **Weekly Monitor & Fixer**: $29/mo / ₹1,999/mo (weekly tracking, 50 prompts, content fixes)
- **Agency & Aggregator**: $99/mo / ₹7,999/mo (10 stores, white-label PDF reports)

---

## 🏗️ Architecture & Database

```
src/
├── app/
│   ├── page.tsx                     # Landing page with interactive live scanner
│   ├── scan/[id]/page.tsx           # Scan report (3 visible, 7 blurred, email capture)
│   ├── dashboard/
│   │   ├── page.tsx                 # GEO Command Center (Store overview & metrics)
│   │   ├── audit/page.tsx           # Deep Audit (JSON-LD, content gaps, llms.txt)
│   │   ├── content-fixer/page.tsx   # AI Content Fixer (Side-by-side seller approval)
│   │   ├── citations/page.tsx       # Competitor Citation Map (PR pitch targets)
│   │   └── monitor/page.tsx         # Weekly tracking timeline & cron runner
│   ├── pricing/page.tsx             # Interactive pricing with INR/USD switcher
│   └── api/
│       ├── scan/                    # POST: run store scan
│       ├── scan/[id]/               # GET/POST: unlock email & fetch scan
│       ├── og/[id]/                 # Dynamic OpenGraph SVG scorecard
│       ├── stores/                  # Connect store & pull products
│       ├── content/suggestions/     # List & approve/sync content diffs
│       ├── tracking/                # Weekly cron execution & email summary
│       ├── export/pdf/              # White-label PDF client report
│       └── billing/                 # Plan upgrades (USD / INR)
└── lib/
    ├── types.ts                     # Full TypeScript schema
    ├── db.ts                        # Typed persistent database layer
    ├── store-fetcher.ts             # Public store scraper (/products.json & sitemap)
    ├── prompt-generator.ts          # 10 realistic buyer queries generator
    ├── scoring.ts                   # 0-100 AI Visibility algorithm & tiers
    ├── audit-engine.ts              # JSON-LD validator & content gap detector
    └── engines/                     # Pluggable AI Engine Architecture
        ├── base.ts                  # EngineRegistry & AIEngineAdapter
        ├── perplexity.ts            # Perplexity Sonar API adapter + search grounding
        ├── openai-search.ts         # OpenAI GPT-4o search adapter
        ├── gemini-grounding.ts      # Gemini Google Search Grounding adapter
        └── google-aio.ts            # Google AI Overviews adapter
```

---

## 🚀 Getting Started

### 1. Install & Build
```bash
npm install
npm run build
```

### 2. Start Application
```bash
npx next start -p 3005
# Open http://localhost:3005
```

### 3. Optional Environment Variables
If configured, AskRank calls live LLM APIs; without them, it seamlessly runs realistic niche-grounded search simulations:
```env
PERPLEXITY_API_KEY=pplx-...
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=AIza...
```
