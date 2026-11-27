# AskRank

**Does AI recommend your store?** AskRank asks ChatGPT Search, Perplexity and Gemini the questions shoppers ask, and shows whether they recommend your store or your competitors. It also shows which sites they cite and what to fix.

> Launching? Read **[MANUAL-STEPS.md](MANUAL-STEPS.md)** first: the accounts, keys and checks only the owner can do.

## What it does

| | Free scan | Deep Audit ($19 one-time) | Weekly Monitor ($29/mo) | Agency ($99/mo) |
|---|---|---|---|---|
| 10 buyer questions × every configured engine, live | ✓ (3 answers, all 10 with email) | ✓ | 20 questions, weekly | 20 questions, weekly, 10 stores |
| Score, competitors, cited sites | ✓ | ✓ | ✓ + history | ✓ + history |
| Product page structured data and content-gap audit, citation targets, llms.txt, JSON-LD | | ✓ | ✓ | ✓ |
| AI Content Fixer (drafts from real product data only) | | | ✓ | ✓ |
| Weekly email, branded PDF | | | email | email + your agency name |

Nothing is simulated: with no AI key configured, scanning is off. AskRank never writes to a store; merchants paste approved drafts into Shopify themselves.

## How a scan works

1. **Read the store** (`src/lib/store-fetcher.ts`): homepage, `/products.json`, sitemap, llms.txt, currency. Public data only.
2. **Write buyer questions** (`src/lib/prompt-generator.ts`): an LLM writes realistic questions from the real catalog and prices. Most don't name the brand, so they measure organic recommendations. Neutral templates are the fallback.
3. **Ask the engines** (`src/lib/engines/*`), with live web search:
   - OpenAI Responses API + `web_search`
   - Perplexity Sonar
   - Gemini + Google Search grounding
4. **Read the answers** (`src/lib/analyze.ts`): deterministic brand matching for "named", an LLM for the ranked brand list (a list/bold parser is the fallback), and own-site citation detection.
5. **Score** (`src/lib/scoring.ts`): 45% named rate, 25% rank, 15% engine coverage, 15% own-site citations.

Scans run in the background (`after()`, up to 300s); the report page polls `/api/scan/:id`. Locked answers are removed on the server (`src/lib/scan-view.ts`).

## Stack

- Next.js 16 (App Router) on Vercel
- Neon Postgres via Prisma
- Dodo Payments (merchant of record, INR + USD)
- Resend (email)
- Magic-link sign-in (JWT cookie)
- Vercel Cron for the weekly monitor (`/api/cron/weekly`, hourly)

## Run locally

```bash
cp .env.example .env      # set DATABASE_URL (any Postgres) and at least one AI key
npm install
npx prisma migrate dev    # creates the tables
npm run dev
```

Without `RESEND_API_KEY`, sign-in links are printed to the server log in development.

```bash
npm test          # unit tests
npm run typecheck
npm run build     # runs prisma migrate deploy, then next build (needs DATABASE_URL)
```

## Key files

| Path | What |
|---|---|
| `prisma/schema.prisma` | Users, scans, stores, purchases, content fixes, rate limits, webhook log |
| `src/lib/scan-runner.ts` | Runs a scan end to end |
| `src/lib/audit-engine.ts` | Deep Audit, llms.txt, JSON-LD, Content Fixer drafts |
| `src/lib/billing.ts`, `src/lib/billing-actions.ts` | Dodo checkout, payment/subscription sync (shared by return redirect and webhook, idempotent) |
| `src/lib/plans.ts` | Prices and plan limits (one source for server and UI) |
| `src/app/api/*` | `scan`, `auth`, `billing`, `stores`, `cron`, `export/pdf`, `og` |
