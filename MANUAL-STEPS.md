# AskRank: what only you can do

Everything in the code is done and tested locally (see "What was tested" at the bottom).
These are the steps that need your accounts, money, identity or judgement. Do them in this order:
step 1 takes the longest, so start it today.

Total time: about 2–3 hours of your work, plus waiting for Dodo to verify your business.
Monthly fixed cost: about $20 (Vercel Pro) + a domain. Everything else is pay-as-you-go.

---

## 1. Dodo Payments: start verification first (takes 1–5 days)

Dodo is the merchant of record: it charges customers in INR and USD, handles GST/VAT and pays out to your Indian bank account.

1. Sign up at https://dodopayments.com and complete business verification (KYC, PAN, bank account). Live payments only work after approval.
   Dodo reviews your website, so do step 3 (deploy) while you wait; the Privacy and Terms pages already exist.
2. In **test mode**, create these products (Products → Add product). Use these exact prices, since the website shows them:

   | Product | Type | Price | Env variable for its ID |
   |---|---|---|---|
   | AskRank Deep Audit | One-time | $19 | `DODO_PRODUCT_REPORT_USD` |
   | AskRank Weekly Monitor | Subscription, monthly | $29 | `DODO_PRODUCT_MONITOR_USD` |
   | AskRank Agency | Subscription, monthly | $99 | `DODO_PRODUCT_AGENCY_USD` |
   | *(optional)* Deep Audit India | One-time | ₹1,499 | `DODO_PRODUCT_REPORT_INR` |
   | *(optional)* Weekly Monitor India | Subscription, monthly | ₹1,999 | `DODO_PRODUCT_MONITOR_INR` |
   | *(optional)* Agency India | Subscription, monthly | ₹7,999 | `DODO_PRODUCT_AGENCY_INR` |

   If you skip the ₹ products, Indian buyers are charged the $ product.
   If you change a price, also change it in `src/lib/plans.ts` (`PRICES`) so the site shows the same number.
3. Developer → API keys: create a key → `DODO_PAYMENTS_API_KEY`.
4. Developer → Webhooks: add the endpoint `https://YOUR-DOMAIN/api/billing/webhook`.
   Subscribe to **payment.succeeded** and all **subscription.\*** events.
   Copy the signing secret (starts with `whsec_`) → `DODO_PAYMENTS_WEBHOOK_KEY`.
5. Keep `DODO_PAYMENTS_ENVIRONMENT=test_mode` until step 8.

## 2. Accounts and API keys (about 30 minutes)

| Service | What to do | Env variable(s) |
|---|---|---|
| **Domain** | Buy one (e.g. askrank.ai, or whatever is free) | `APP_URL=https://yourdomain` |
| **OpenAI** | platform.openai.com → add billing → create a key. **Set a monthly spend limit** (Settings → Limits), e.g. $50 to start | `OPENAI_API_KEY` |
| **Perplexity** | perplexity.ai/settings/api → add credit → create a key | `PERPLEXITY_API_KEY` |
| **Google Gemini** | aistudio.google.com → Get API key. The free tier works for testing; enable billing before launch, or grounded answers get rate-limited | `GEMINI_API_KEY` |
| **Resend** (email) | resend.com → Domains → add your domain → add the DNS records it shows → API key | `RESEND_API_KEY`, `EMAIL_FROM="AskRank <hello@yourdomain>"` |

You need at least one AI key. With none, the scan form says scanning is off; it never shows fake results.

**Rough AI cost** (check each provider's pricing page, since prices change):
- One free scan (10 questions × 3 engines, plus prompt-writing and answer-reading calls): **about $0.50–$1**.
- One Weekly Monitor store (20 questions × 3 engines × ~4 runs a month): **about $5–10/month** against $29 revenue.
- The defaults limit free scans to 3 per visitor per day and 150 per day in total (worst case about $150/day). Lower `FREE_SCANS_PER_DAY` until you have paying customers, e.g. 40.
- To cut cost, run 2 engines: `ENABLED_ENGINES=openai_search,perplexity`.

## 3. Deploy on Vercel + Neon (about 20 minutes)

Your repo is **already connected to a Vercel project** (`ask-rank`, which currently serves the old demo from `main`), so you don't need to import it again.

1. Vercel → **upgrade to Pro ($20/month)** before you take money: Vercel's Hobby plan is for non-commercial use only.
   The weekly-monitor job runs once a day (03:17 UTC) and handles about 8 stores per run. Once you pass ~50 tracked stores, change the schedule in `vercel.json` to hourly (`"17 * * * *"`; Pro only).
2. Project `ask-rank` → Storage → **Create Database → Neon (Postgres)**, connected to Production and Preview. This sets `DATABASE_URL` and `DATABASE_URL_UNPOOLED` for you.
3. Project → Settings → Environment Variables: add everything from `.env.example`. Generate the two secrets with:
   ```
   openssl rand -hex 32
   ```
   one for `AUTH_SECRET` and one for `CRON_SECRET`.
4. Merge pull request #2 (`deployment-ready` → `main`). Vercel then builds production and runs the database migrations automatically.
   - If you merge **before** step 2, the production build stops with "DATABASE_URL is not set" and the old demo stays live. Nothing breaks; add the database and redeploy.
   - Preview builds of branches work without a database; their pages that need data show an error until one is connected.
5. Settings → Domains: add your domain and set the DNS records Vercel shows.
6. Settings → Functions: confirm **Fluid compute** is on (it is by default on new projects). Scans run up to 5 minutes in the background.
7. Open `https://YOUR-DOMAIN/api/health?key=YOUR_CRON_SECRET`. It lists every setting as present or missing (never the values). Fix anything missing, then redeploy.

## 4. Check the AI results by eye (15 minutes) before anyone pays

The engine and payment code was checked field by field against each provider's official SDK types (OpenAI, Perplexity, Google Gen AI and Dodo Payments, as published on npm in November 2026). It was not run against the live APIs, because this build machine can't reach them. So:

1. From your computer, in the repo folder, run (it uses about $0.50–$1 of API credit):
   ```
   node scripts/smoke.mjs https://YOUR-DOMAIN YOUR_CRON_SECRET yourstore.com
   ```
   It lists any missing settings, runs a real scan and prints what each engine answered.
2. Run a free scan on the website of **your own store** and of 2–3 real Shopify stores you know.
3. Open each question and read the answers. Check:
   - The answers are real and the cited links open.
   - "Named" / "Not named" is right for the store.
   - The competitor list contains brand names, not junk.
4. If a scan fails, check Vercel → Logs. The usual cause is a wrong key or a model name your account can't use.
   You can change models with the optional `*_MODEL` variables in `.env.example`, without touching code.

## 5. Test a payment end to end (10 minutes, still in test mode)

1. On a scan, click **Get the Deep Audit** and pay with Dodo's test card (Dodo docs → Testing).
2. You should land back on the report with the Deep Audit unlocked and get an email.
3. Sign in (top right), go to Pricing, start **Weekly Monitor**, add your store, and wait for the first run.
4. In the dashboard click **Manage billing** → cancel → refresh: the plan drops to Free.

## 6. Legal and brand checks (30 minutes, your call)

- [ ] Read `/privacy` and `/terms`. They are plain-English starting points, **not legal advice**. Set `NEXT_PUBLIC_COMPANY_NAME` to your legal business name and `NEXT_PUBLIC_SUPPORT_EMAIL` to a mailbox you read.
- [ ] **Hero photos** (`public/images/*.jpg`): I don't know where they came from. If you can't confirm you have the rights to use them, replace them.
- [ ] **Landing page design**: the original was modelled on Railroad.ai. A reference screenshot of their site was in the repo, and the layout, glass input and cloud logo still follow it. I replaced the copied headline and deleted the screenshot. Consider changing the hero layout so it doesn't look like their site.
- [ ] Unlocking a report collects an email. The form says you may email them about their results. Only send cold follow-ups in ways that respect anti-spam law where they are (India's DPDP Act, the US CAN-SPAM Act, GDPR for the EU/UK).

## 7. Go live

1. Once Dodo approves your business: switch Dodo to **live mode** and recreate the products and webhook there. Live and test have separate IDs and keys.
2. On Vercel, update `DODO_PAYMENTS_ENVIRONMENT=live_mode`, the live `DODO_PAYMENTS_API_KEY`, `DODO_PAYMENTS_WEBHOOK_KEY` and all the `DODO_PRODUCT_*` IDs, then redeploy.
3. Make one real ₹1,499 / $19 purchase yourself and refund it from the Dodo dashboard.

---

## What was tested

Locally, with Postgres and the production build (`next start`), with OpenAI, Perplexity, Gemini, Dodo and Resend replaced by mock responses in their documented formats:

- **Free scan:** real store reading (name, currency, products), prompt writing, 3 engines, brand extraction, score, cached re-scan.
- **Locking:** the server only sends 3 of 10 answers before email unlock.
- **Rate limits:** per-IP limit and daily cap.
- **Unreachable store:** shows a clear error.
- **Deep Audit purchase:**
  - the audit stays locked before payment
  - payments that are still processing, or were made for another scan, are rejected
  - a successful payment unlocks it exactly once, even when the redirect repeats
  - the receipt email is sent
- **Deep Audit contents:** product page checks, flags review markup without a count, competitor citation sites, llms.txt, JSON-LD.
- **Sign-in:** magic link works once, isn't used up by opening the email, and blocks open redirects.
- **Subscription:** checkout, return (someone else's subscription is rejected), plan limits, adding a store starts a 20-question run, "Run now" limited to once a day.
- **Webhooks:** bad signature rejected, replay ignored, cancellation downgrades the plan.
- **Weekly cron:** needs the secret, runs due stores, reschedules them a week out, sends the weekly email.
- **Content Fixer:** description, FAQ and JSON-LD drafts; marking drafts applied; owner-only access.
- **Output:** PDF page, PNG share card (1200×630), mobile layout without horizontal scroll.
- **Unit tests:** `npm test`, 26 tests (engine parsers, brand matching, scoring, webhook signatures).
- **Fresh-database deploy:** `npm run build` against an empty Postgres applies the migration and builds, as Vercel will.
- **API formats:** request and response fields checked against the official SDK types for Dodo Payments, OpenAI, Perplexity and Google Gen AI (endpoints, field names, statuses, webhook event names, Standard Webhooks signatures).
- **CI:** GitHub Actions runs typecheck, tests and a full build with Postgres on every push and pull request.
