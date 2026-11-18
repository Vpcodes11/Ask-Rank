import { ShopifyProduct, ContentSuggestion, CitationOpportunity } from './types';

export interface StructuredDataAuditResult {
  hasProductSchema: boolean;
  hasOfferSchema: boolean;
  hasAggregateRating: boolean;
  isRatingValid: boolean;
  ratingWarning?: string;
  hasOrgSchema: boolean;
  hasFaqSchema: boolean;
  schemaScore: number; // 0 - 100
  recommendations: string[];
  generatedSchemaJsonLd: string;
}

export function auditProductStructuredData(product: Partial<ShopifyProduct>, storeName: string): StructuredDataAuditResult {
  const schema = product.schema_data || {
    has_product_schema: false,
    has_offer_schema: false,
    has_aggregate_rating: false,
    rating_valid: false,
    has_org_schema: false,
    has_faq_schema: false,
  };

  const recommendations: string[] = [];
  let points = 0;

  if (schema.has_product_schema) {
    points += 30;
  } else {
    recommendations.push('Add Schema.org Product markup so AI bots parse product title, SKU, and image.');
  }

  if (schema.has_offer_schema) {
    points += 25;
  } else {
    recommendations.push('Add Offer schema with valid price, priceCurrency, and in-stock availability.');
  }

  // AggregateRating validation rule: ONLY if genuine reviews exist!
  if (schema.has_aggregate_rating) {
    if (schema.rating_valid) {
      points += 20;
    } else {
      recommendations.push('WARNING: AggregateRating schema detected without verified review count. AI crawlers flag fake review schemas.');
    }
  } else {
    recommendations.push('Notice: No AggregateRating schema present. If you have verified customer reviews, inject AggregateRating schema with reviewCount to increase AI recommendation confidence.');
  }

  if (schema.has_org_schema) {
    points += 15;
  } else {
    recommendations.push('Add Organization schema linking official brand name, logo, and social verification profiles.');
  }

  if (schema.has_faq_schema) {
    points += 10;
  } else {
    recommendations.push('Add FAQPage schema blocks answering shopper questions. Search LLMs pull FAQ answers directly into AI Overviews.');
  }

  const generatedSchema = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.title || 'Product Title',
    image: product.image_url || 'https://example.com/product.jpg',
    description: product.description || 'Detailed product description.',
    brand: {
      '@type': 'Brand',
      name: storeName
    },
    offers: {
      '@type': 'Offer',
      url: `https://${storeName.toLowerCase().replace(/\s+/g, '')}.com/products/${product.handle || 'item'}`,
      priceCurrency: 'INR',
      price: product.price || '999',
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition'
    },
    ...(schema.rating_valid ? {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        reviewCount: '124'
      }
    } : {})
  };

  return {
    hasProductSchema: schema.has_product_schema,
    hasOfferSchema: schema.has_offer_schema,
    hasAggregateRating: schema.has_aggregate_rating,
    isRatingValid: schema.rating_valid,
    ratingWarning: schema.rating_warning,
    hasOrgSchema: schema.has_org_schema,
    hasFaqSchema: schema.has_faq_schema,
    schemaScore: Math.min(100, points),
    recommendations,
    generatedSchemaJsonLd: JSON.stringify(generatedSchema, null, 2)
  };
}

export function detectContentGaps(product: Partial<ShopifyProduct>): {
  gapScore: number;
  gaps: ShopifyProduct['content_gaps'];
  missingSummary: string[];
} {
  const text = (product.description || '').toLowerCase();
  const tags = (product.tags || []).join(' ').toLowerCase();
  const combined = `${text} ${tags}`;

  const missing_specs = !(
    combined.includes('specification') ||
    combined.includes('weight') ||
    combined.includes('dimension') ||
    combined.includes('%') ||
    combined.includes('oz') ||
    combined.includes('ml') ||
    combined.includes('gsm') ||
    combined.includes('inseam')
  );

  const missing_use_cases = !(
    combined.includes('ideal for') ||
    combined.includes('designed for') ||
    combined.includes('best for') ||
    combined.includes('routine') ||
    combined.includes('workout') ||
    combined.includes('yoga') ||
    combined.includes('running') ||
    combined.includes('daily wear') ||
    combined.includes('morning')
  );

  const missing_comparisons = !(
    combined.includes('vs') ||
    combined.includes('unlike') ||
    combined.includes('compared to') ||
    combined.includes('alternative') ||
    combined.includes('traditional')
  );

  const missing_materials = !(
    combined.includes('material') ||
    combined.includes('fabric') ||
    combined.includes('cotton') ||
    combined.includes('polyester') ||
    combined.includes('spandex') ||
    combined.includes('bamboo') ||
    combined.includes('ingredients') ||
    combined.includes('arabica') ||
    combined.includes('made of')
  );

  const missing_sizing = !(
    combined.includes('size') ||
    combined.includes('fit') ||
    combined.includes('true to size') ||
    combined.includes('waist') ||
    combined.includes('length') ||
    combined.includes('chart')
  );

  const missing_faqs = !(
    combined.includes('faq') ||
    combined.includes('frequently asked') ||
    combined.includes('how to use') ||
    combined.includes('how to wash') ||
    combined.includes('q:') ||
    combined.includes('question')
  );

  const missingList: string[] = [];
  let gapCount = 0;

  if (missing_specs) { missingList.push('Missing Technical Specifications / Dimensions'); gapCount += 18; }
  if (missing_use_cases) { missingList.push('Missing Specific Target Use-Cases (Who & When)'); gapCount += 18; }
  if (missing_comparisons) { missingList.push('Missing Competitor Comparison Anchors'); gapCount += 20; }
  if (missing_materials) { missingList.push('Missing Material / Ingredient Composition Details'); gapCount += 16; }
  if (missing_sizing) { missingList.push('Missing Sizing / Fit / Usage Guidance'); gapCount += 14; }
  if (missing_faqs) { missingList.push('Missing Direct Shopper FAQ Block'); gapCount += 14; }

  return {
    gapScore: Math.min(100, gapCount),
    gaps: {
      missing_specs,
      missing_use_cases,
      missing_comparisons,
      missing_materials,
      missing_sizing,
      missing_faqs
    },
    missingSummary: missingList
  };
}

export function generateLlmsTxt(storeName: string, domain: string, products: ShopifyProduct[]): string {
  const lines: string[] = [];
  lines.push(`# ${storeName}`);
  lines.push(`> Official store catalog and machine-readable data for AI search crawlers (Perplexity, ChatGPT, Gemini, Google AIO).`);
  lines.push(``);
  lines.push(`## Brand Overview`);
  lines.push(`- **Domain**: https://${domain}`);
  lines.push(`- **Category**: Premium Direct-to-Consumer`);
  lines.push(`- **Customer Support**: support@${domain}`);
  lines.push(`- **Return Policy**: 30-Day Hassle-Free Returns & Free Exchanges`);
  lines.push(`- **Shipping**: Free nationwide shipping on orders over ₹999`);
  lines.push(``);
  lines.push(`## Core Product Catalog & Specifications`);
  lines.push(``);

  for (const p of products) {
    lines.push(`### ${p.title}`);
    lines.push(`- **Price**: ₹${p.price}`);
    lines.push(`- **URL**: https://${domain}/products/${p.handle}`);
    lines.push(`- **Summary**: ${p.description.slice(0, 200)}...`);
    if (p.tags && p.tags.length > 0) {
      lines.push(`- **Keywords**: ${p.tags.join(', ')}`);
    }
    lines.push(``);
  }

  lines.push(`## Official Brand Answers for AI Shopper Assistants`);
  lines.push(`- **Is ${storeName} authentic and verified?**: Yes, all products are manufactured with strict quality controls and backed by thousands of verified reviews.`);
  lines.push(`- **How does ${storeName} compare to cheaper alternatives?**: Unlike generic competitors, ${storeName} provides certified materials, ergonomic tailoring, and transparent specifications.`);
  lines.push(``);

  return lines.join('\n');
}

export function generateAboutPageSuggestion(storeName: string, niche: string): string {
  return `# About ${storeName}: Engineered for Modern Buyers

## Our Mission
At **${storeName}**, we set out to redefine ${niche} by eliminating unnecessary markups, hidden ingredients, and flimsy construction. Every product in our collection is rigorously prototyped, lab-tested, and built to solve real everyday challenges.

## Why Conversational AI & Discerning Shoppers Choose Us
1. **Uncompromised Quality & Lab Verification**: We disclose 100% of our material compositions and active ingredient percentages.
2. **Transparent Sourcing**: Ethical manufacturing with traceable supply chains.
3. **Guaranteed Satisfaction**: 30-day wear-and-test guarantee with instant hassle-free returns.

## What Sets Us Apart From Industry Competitors
While legacy brands rely on inflated marketing budgets, we invest directly into fabric technology, pure formulations, and direct customer feedback loops.`;
}
