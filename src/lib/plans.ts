/** Single source of truth for what each plan costs and includes. Shared by server and UI. */

export type PlanId = 'free' | 'monitor' | 'agency';
export type Currency = 'USD' | 'INR';

export interface PlanLimits {
  stores: number;
  /** Buyer prompts per weekly run */
  promptsPerRun: number;
  /** AI content drafts per store per month */
  fixesPerMonth: number;
  whiteLabel: boolean;
}

export const PLAN_LIMITS: Record<PlanId, PlanLimits> = {
  free: { stores: 0, promptsPerRun: 0, fixesPerMonth: 0, whiteLabel: false },
  monitor: { stores: 1, promptsPerRun: 20, fixesPerMonth: 60, whiteLabel: false },
  agency: { stores: 10, promptsPerRun: 20, fixesPerMonth: 60, whiteLabel: true },
};

export const FREE_SCAN_PROMPTS = 10;
export const FREE_VISIBLE_PROMPTS = 3;

export const PRICES: Record<'report' | 'monitor' | 'agency', Record<Currency, number>> = {
  report: { USD: 19, INR: 1499 },
  monitor: { USD: 29, INR: 1999 },
  agency: { USD: 99, INR: 7999 },
};

export function formatPrice(product: keyof typeof PRICES, currency: Currency) {
  const n = PRICES[product][currency];
  return currency === 'INR' ? `₹${n.toLocaleString('en-IN')}` : `$${n}`;
}

export const PLAN_CARDS = [
  {
    id: 'free' as const,
    name: 'Free scan',
    period: '',
    blurb: 'See if AI assistants recommend your store today.',
    features: [
      '10 real buyer questions asked to ChatGPT Search, Perplexity and Gemini',
      'AI Visibility Score (0–100)',
      'Who AI recommends instead of you',
      '3 answers free, all 10 with your email',
      'Shareable score card',
    ],
  },
  {
    id: 'report' as const,
    name: 'Deep Audit',
    period: 'one-time',
    blurb: 'Everything behind your score, and what to fix first.',
    features: [
      'Everything in the free scan',
      'Structured data check of up to 10 product pages',
      'Review markup (AggregateRating) validity check',
      'Content gaps per product (specs, materials, sizing, FAQs)',
      'Sites AI cites for competitors: your outreach list',
      'Ready-to-paste llms.txt and Product JSON-LD',
      'Printable PDF report',
    ],
  },
  {
    id: 'monitor' as const,
    name: 'Weekly Monitor',
    period: '/month',
    popular: true,
    blurb: 'Track your AI visibility every week and fix what holds it back.',
    features: [
      '1 store',
      '20 buyer questions re-run every week on every engine',
      'Score history and competitor changes',
      'Deep Audit on every run',
      'AI Content Fixer: descriptions and FAQs drafted from your real product data',
      'Weekly email summary',
    ],
  },
  {
    id: 'agency' as const,
    name: 'Agency',
    period: '/month',
    blurb: 'Run AI visibility reports for your clients.',
    features: [
      'Up to 10 stores',
      'Everything in Weekly Monitor, for each store',
      'Reports branded with your agency name',
      'Free scans to use as sales openers',
    ],
  },
];
