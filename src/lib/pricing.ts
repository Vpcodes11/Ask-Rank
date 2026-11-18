export const PRICING_PLANS = {
  free: {
    id: 'free',
    name: 'Free Scan',
    priceUsd: 0,
    priceInr: 0,
    interval: 'free',
    features: [
      'Store public crawl (/products.json & sitemap)',
      '10 buyer prompts generated',
      '3 prompts visible (7 blurred)',
      'AI Visibility Score (0-100)',
      'Shareable OG badge card'
    ]
  },
  report: {
    id: 'report',
    name: 'Full Deep Audit Report',
    priceUsd: 19,
    priceInr: 1499,
    interval: 'one_time',
    features: [
      'Unlocks all 10 buyer prompts across all engines',
      'Complete Structured Data (JSON-LD) audit',
      'AggregateRating validity penalty check',
      'Product content gaps analysis for all products',
      'Full Competitor Citation Intelligence list',
      'Exportable high-res PDF report'
    ]
  },
  monitor: {
    id: 'monitor',
    name: 'Weekly Monitor & Fixer',
    priceUsd: 29,
    priceInr: 1999,
    interval: 'monthly',
    popular: true,
    features: [
      'Everything in Full Report',
      'Weekly automated prompt runs (50 commercial prompts)',
      'Score tracking timeline & historical charts',
      'AI Content Fixer: generate descriptions & FAQ blocks',
      'Seller approval workflow before write-back to Shopify',
      'Machine-readable llms.txt & About Page builder',
      'Weekly email digest to founders'
    ]
  },
  agency: {
    id: 'agency',
    name: 'Agency & Aggregator',
    priceUsd: 99,
    priceInr: 7999,
    interval: 'monthly',
    features: [
      'Everything in Weekly Monitor',
      'Up to 10 connected Shopify stores',
      'White-label PDF reports (Custom agency logo & domain)',
      'Client presentation portal & exportable deck slides',
      'Dedicated API endpoint & webhook alerts',
      'Priority engine execution'
    ]
  }
};
