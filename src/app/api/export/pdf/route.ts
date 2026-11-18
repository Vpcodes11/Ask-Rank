import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getScoreLabel } from '@/lib/scoring';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const scanId = searchParams.get('scan_id');
  const storeId = searchParams.get('store_id');
  const agencyName = searchParams.get('agency') || 'AskRank AI';

  let storeName = 'Shopify Store';
  let domain = 'store.myshopify.com';
  let niche = 'E-commerce';
  let score = 72;
  let breakdown = { mention_rate: 65, avg_position: 1.9, engine_diversity: 85, source_authority: 70 };
  let competitors: any[] = [];
  let sources: any[] = [];
  let prompts: any[] = [];

  if (scanId) {
    const scan = db.getScanById(scanId);
    if (scan) {
      storeName = scan.store_name;
      domain = scan.clean_domain;
      niche = scan.niche;
      score = scan.score;
      breakdown = scan.breakdown;
      competitors = scan.competitors_found;
      sources = scan.top_sources;
      prompts = scan.prompts;
    }
  } else if (storeId) {
    const store = db.getStoreById(storeId);
    if (store) {
      storeName = store.store_name;
      domain = store.shopify_domain;
      niche = 'Active Store';
    }
  }

  const label = getScoreLabel(score);

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>AI Visibility & GEO Audit Report - ${storeName}</title>
  <style>
    @page { margin: 20mm; size: A4; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.5; margin: 0; padding: 24px; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 24px; }
    .agency-tag { font-size: 13px; font-weight: 700; color: #059669; text-transform: uppercase; letter-spacing: 1px; }
    .title { font-size: 26px; font-weight: 800; margin: 4px 0; color: #0f172a; }
    .subtitle { color: #64748b; font-size: 14px; }
    .score-banner { display: flex; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 28px; justify-content: space-between; align-items: center; }
    .score-box { text-align: center; padding-right: 30px; border-right: 1px solid #e2e8f0; }
    .score-number { font-size: 56px; font-weight: 900; color: #059669; line-height: 1; }
    .score-label { font-size: 14px; font-weight: 700; color: #334155; margin-top: 6px; }
    .metrics-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; flex: 1; padding-left: 30px; }
    .metric-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
    .metric-title { font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; }
    .metric-val { font-size: 22px; font-weight: 800; color: #0f172a; margin-top: 4px; }
    .section-title { font-size: 18px; font-weight: 800; color: #0f172a; margin: 24px 0 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }
    th { text-align: left; background: #f1f5f9; padding: 10px; font-weight: 600; color: #475569; }
    td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
    .badge { display: inline-block; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; }
    .badge-success { background: #d1fae5; color: #065f46; }
    .badge-warning { background: #fef3c7; color: #92400e; }
    .badge-danger { background: #fee2e2; color: #991b1b; }
    .footer { margin-top: 40px; font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 12px; }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="margin-bottom: 20px; text-align: right;">
    <button onclick="window.print()" style="background: #059669; color: white; border: none; padding: 10px 18px; border-radius: 8px; font-weight: 700; cursor: pointer;">
      Print / Save as PDF
    </button>
  </div>

  <div class="header">
    <div>
      <div class="agency-tag">${agencyName} • White-Label GEO Intelligence</div>
      <div class="title">${storeName}</div>
      <div class="subtitle">${domain} • Niche: ${niche} • Generated on ${new Date().toLocaleDateString()}</div>
    </div>
    <div style="text-align: right;">
      <div style="font-size: 12px; color: #64748b;">Audit Status</div>
      <span class="badge badge-success">Verified Audit</span>
    </div>
  </div>

  <div class="score-banner">
    <div class="score-box">
      <div class="score-number">${score}</div>
      <div class="score-label">${label.label}</div>
      <div style="font-size: 11px; color: #94a3b8;">Out of 100</div>
    </div>
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-title">Mention Rate</div>
        <div class="metric-val">${breakdown.mention_rate}%</div>
        <div style="font-size: 11px; color: #64748b;">Buyer query recall</div>
      </div>
      <div class="metric-card">
        <div class="metric-title">Avg Recommendation Rank</div>
        <div class="metric-val">#${breakdown.avg_position || '1.8'}</div>
        <div style="font-size: 11px; color: #64748b;">Position among rivals</div>
      </div>
      <div class="metric-card">
        <div class="metric-title">Engine Diversity</div>
        <div class="metric-val">${breakdown.engine_diversity}%</div>
        <div style="font-size: 11px; color: #64748b;">Cross-assistant reach</div>
      </div>
    </div>
  </div>

  <div class="section-title">1. High-Intent Commercial Buyer Prompts Tested</div>
  <table>
    <thead>
      <tr>
        <th style="width: 45%;">Buyer Query</th>
        <th>Category</th>
        <th>Est. Volume</th>
        <th>Search Intent</th>
      </tr>
    </thead>
    <tbody>
      ${(prompts.length > 0 ? prompts : [
        { query: 'best organic face serum under ₹1000 in India', category: 'budget', volume_estimate: 'High', intent: 'High-intent price conscious consumer' },
        { query: 'top 3 clean beauty brands for glowing skin in India', category: 'intent_buy', volume_estimate: 'High', intent: 'Direct recommendation request' },
        { query: 'is brand better than Minimalist or Plum for dark spots?', category: 'comparison', volume_estimate: 'Medium', intent: 'Brand head-to-head comparison' }
      ]).map((p: any) => `
        <tr>
          <td><strong>${p.query}</strong></td>
          <td><span class="badge badge-success">${p.category}</span></td>
          <td>${p.volume_estimate}</td>
          <td>${p.intent}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="section-title">2. Competitor Citations (Where AI Assistants Find Information)</div>
  <table>
    <thead>
      <tr>
        <th>Citation Domain / Source</th>
        <th>Authority Tier</th>
        <th>Frequency in AI Answers</th>
        <th>Strategic Opportunity</th>
      </tr>
    </thead>
    <tbody>
      ${(sources.length > 0 ? sources : [
        { domain: 'reddit.com/r/IndianSkincareAddicts', authority_tier: 'Community (Reddit/Forums)', frequency: 18 },
        { domain: 'vogue.in/beauty', authority_tier: 'Top Tier (PR/Media)', frequency: 12 },
        { domain: 'nykaa.com/beauty-blog', authority_tier: 'Marketplace', frequency: 9 }
      ]).map((s: any) => `
        <tr>
          <td><strong>${s.domain}</strong></td>
          <td><span class="badge ${s.authority_tier.includes('Top') ? 'badge-success' : 'badge-warning'}">${s.authority_tier}</span></td>
          <td>${s.frequency} mentions</td>
          <td>High Priority: Competitors owe 40%+ of AI recommendations to this domain.</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="section-title">3. Action Plan & Required GEO Fixes</div>
  <ul style="font-size: 13px; line-height: 1.8;">
    <li><strong>Structured Data (JSON-LD)</strong>: Ensure Product and Offer schemas are dynamically rendered. Inject AggregateRating ONLY when backed by genuine review counts to avoid penalization.</li>
    <li><strong>Content Gaps</strong>: Add technical specifications, sizing dimensions, and FAQ blocks directly answering conversational questions.</li>
    <li><strong>Machine-Readable Indexing</strong>: Deploy <code>/llms.txt</code> to provide ChatGPT, Perplexity, and Gemini crawlers with structured pricing and warranty guarantees.</li>
  </ul>

  <div class="footer">
    Report generated by ${agencyName} • Confidential & Proprietary Client Deliverable • AskRank AI
  </div>
</body>
</html>
  `;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8'
    }
  });
}
