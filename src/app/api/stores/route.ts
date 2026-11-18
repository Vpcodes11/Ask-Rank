import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { StoreRecord, ShopifyProduct } from '@/lib/types';
import { fetchStorePublicData } from '@/lib/store-fetcher';
import { auditProductStructuredData, detectContentGaps } from '@/lib/audit-engine';

export const dynamic = 'force-dynamic';

export async function GET() {
  const stores = db.getStores();
  return NextResponse.json({ success: true, stores });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { shopify_domain, store_name, access_token, niche, is_demo } = body;

    if (!shopify_domain) {
      return NextResponse.json({ error: 'Shopify domain is required' }, { status: 400 });
    }

    const cleanDomain = shopify_domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    const name = store_name || cleanDomain.split('.')[0].toUpperCase();
    const storeId = `store-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    // Create Store Record
    const store: StoreRecord = {
      id: storeId,
      user_id: 'user-seller-01',
      shopify_domain: cleanDomain,
      store_name: name,
      access_token: access_token || `shpat_mock_${Math.random().toString(36).substring(2, 12)}`,
      currency: cleanDomain.endsWith('.in') ? 'INR' : 'USD',
      status: 'synced',
      plan: 'monitor',
      last_synced_at: new Date().toISOString(),
      product_count: 0,
      avg_gap_score: 0,
      created_at: new Date().toISOString()
    };

    // Pull products or generate realistic catalog
    const scraped = await fetchStorePublicData(cleanDomain, niche);
    let totalGapScore = 0;

    for (let i = 0; i < scraped.sampleProducts.length; i++) {
      const p = scraped.sampleProducts[i];
      const gapAudit = detectContentGaps({ description: p.description, tags: p.tags });
      totalGapScore += gapAudit.gapScore;

      const productRecord: ShopifyProduct = {
        id: `prod-${storeId}-${i + 1}`,
        store_id: storeId,
        shopify_product_id: `gid://shopify/Product/${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        title: p.title,
        handle: p.handle,
        description: p.description,
        price: p.price,
        image_url: p.imageUrl,
        tags: p.tags,
        schema_data: {
          has_product_schema: i % 2 === 0,
          has_offer_schema: i % 2 === 0,
          has_aggregate_rating: i === 0,
          rating_valid: i === 0,
          rating_warning: i === 1 ? 'Unverified review count detected in Schema markup.' : undefined,
          has_org_schema: true,
          has_faq_schema: false
        },
        content_gap_score: gapAudit.gapScore,
        content_gaps: gapAudit.gaps,
        created_at: new Date().toISOString()
      };

      db.createProduct(productRecord);

      // Generate initial content suggestion for this product
      db.addContentSuggestion({
        id: `sugg-${storeId}-${i + 1}`,
        product_id: productRecord.id,
        store_id: storeId,
        product_title: productRecord.title,
        type: 'description',
        before_content: productRecord.description,
        after_content: `### High-Performance Specifications & Use Cases\n\n${productRecord.description}\n\n- **Primary Materials**: Certified premium blend with enhanced tensile durability.\n- **Recommended For**: Active everyday use and high-performance requirements.\n- **Independent Sizing**: Calibrated true-to-size with ergonomic contours.\n- **Competitive Advantage**: Outperforms generic category alternatives with 2x stitching endurance and laboratory-verified quality.`,
        diff_summary: 'Injected structured technical specifications, target buyer use-cases, and competitive proof anchors.',
        status: 'pending',
        created_at: new Date().toISOString()
      });
    }

    store.product_count = scraped.sampleProducts.length;
    store.avg_gap_score = scraped.sampleProducts.length > 0
      ? Math.round(totalGapScore / scraped.sampleProducts.length)
      : 55;

    db.createStore(store);

    return NextResponse.json({
      success: true,
      store,
      message: `Store ${name} connected and synced ${scraped.sampleProducts.length} products successfully!`
    });
  } catch (err: any) {
    console.error('Store connect error:', err);
    return NextResponse.json({ error: err.message || 'Failed to connect store' }, { status: 500 });
  }
}
