import { NextRequest, NextResponse } from 'next/server';
import { fetchStorePublicData } from '@/lib/store-fetcher';
import { generateBuyerPrompts } from '@/lib/prompt-generator';
import { EngineRegistry } from '@/lib/engines';
import { calculateAIVisibilityScore } from '@/lib/scoring';
import { db } from '@/lib/db';
import { ScanRecord, PromptRunResult } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, niche, email } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Please provide a valid store URL' }, { status: 400 });
    }

    // 1. Fetch store public data (/products.json, homepage, sitemap)
    const storeData = await fetchStorePublicData(url, niche);

    // 2. Generate 10 realistic buyer prompts tailored to niche and currency
    const buyerPrompts = generateBuyerPrompts(storeData.storeName, storeData.niche, storeData.currency);

    // 3. Query pluggable AI engines
    const engines = EngineRegistry.getActiveEngines();
    const results: PromptRunResult[] = [];

    for (let i = 0; i < buyerPrompts.length; i++) {
      const promptObj = buyerPrompts[i];
      // Run across each engine
      for (const engine of engines) {
        const engineOutput = await engine.query(promptObj.query, {
          brandName: storeData.storeName,
          storeUrl: `https://${storeData.cleanDomain}`,
          niche: storeData.niche,
          sampleProducts: storeData.sampleProducts
        });

        results.push({
          id: `run-${Date.now()}-${i}-${engine.id}`,
          prompt_id: promptObj.id,
          prompt: promptObj.query,
          engine: engine.id,
          engine_name: engine.name,
          mentioned: engineOutput.mentioned,
          product_mentioned: engineOutput.productMentioned,
          mentioned_products: engineOutput.mentionedProducts,
          position: engineOutput.position,
          competitors: engineOutput.competitors,
          sources: engineOutput.sources,
          raw_response: engineOutput.rawResponse,
          run_at: new Date().toISOString()
        });
      }
    }

    // 4. Calculate overall AI Visibility Score (0-100) & breakdown
    const scoreData = calculateAIVisibilityScore(results, storeData.storeName);

    // 5. Build and save Scan Record
    const scanId = `scan-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const shareSlug = `${storeData.cleanDomain.replace(/[^a-z0-9]/g, '-')}-${Math.random().toString(36).substring(2, 6)}`;

    const scanRecord: ScanRecord = {
      id: scanId,
      url: `https://${storeData.cleanDomain}`,
      clean_domain: storeData.cleanDomain,
      store_name: storeData.storeName,
      niche: storeData.niche,
      email: email ? String(email).trim() : null,
      score: scoreData.score,
      breakdown: scoreData.breakdown,
      prompts: buyerPrompts,
      results,
      competitors_found: scoreData.competitorsFound,
      top_sources: scoreData.topSources,
      share_slug: shareSlug,
      unlocked: Boolean(email),
      created_at: new Date().toISOString()
    };

    db.createScan(scanRecord);

    return NextResponse.json({
      success: true,
      scan: scanRecord
    });
  } catch (err: any) {
    console.error('Scan failed:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to process store scan. Please try again.' },
      { status: 500 }
    );
  }
}
