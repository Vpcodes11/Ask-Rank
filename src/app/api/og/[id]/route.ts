import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getScoreLabel } from '@/lib/scoring';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const scan = db.getScanById(id);

  const storeName = scan?.store_name || 'Shopify Brand';
  const score = scan?.score ?? 68;
  const niche = scan?.niche || 'D2C E-commerce';
  const domain = scan?.clean_domain || 'brand.myshopify.com';
  const mentionRate = scan?.breakdown.mention_rate ?? 60;
  const avgPos = scan?.breakdown.avg_position ?? 1.8;
  const labelInfo = getScoreLabel(score);

  // SVG dimensions for OG Card (1200 x 630 standard)
  const svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a0f1d" />
      <stop offset="50%" stop-color="#0d1527" />
      <stop offset="100%" stop-color="#060913" />
    </linearGradient>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10b981" />
      <stop offset="100%" stop-color="#06b6d4" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="40" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bgGrad)" />
  
  <!-- Subtle Grid Lines -->
  <line x1="80" y1="0" x2="80" y2="630" stroke="#1e293b" stroke-opacity="0.4" stroke-width="1" />
  <line x1="1120" y1="0" x2="1120" y2="630" stroke="#1e293b" stroke-opacity="0.4" stroke-width="1" />
  <line x1="0" y1="520" x2="1200" y2="520" stroke="#1e293b" stroke-opacity="0.4" stroke-width="1" />

  <!-- Glowing background orbs -->
  <circle cx="950" cy="200" r="160" fill="#10b981" fill-opacity="0.12" filter="url(#glow)" />
  <circle cx="250" cy="450" r="140" fill="#6366f1" fill-opacity="0.08" filter="url(#glow)" />

  <!-- Brand Badge Top Left -->
  <g transform="translate(100, 70)">
    <rect width="140" height="38" rx="8" fill="#10b981" fill-opacity="0.15" stroke="#10b981" stroke-opacity="0.4" />
    <text x="18" y="24" fill="#34d399" font-family="system-ui, sans-serif" font-weight="700" font-size="14" letter-spacing="1.5">ASKRANK.AI</text>
    <text x="160" y="24" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="14">AI Assistant Visibility Audit</text>
  </g>

  <!-- Store Name & Niche -->
  <g transform="translate(100, 160)">
    <text x="0" y="44" fill="#f8fafc" font-family="system-ui, sans-serif" font-weight="800" font-size="52" letter-spacing="-1">${escapeXml(storeName)}</text>
    <text x="0" y="90" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="22">${escapeXml(domain)} • ${escapeXml(niche)}</text>
  </g>

  <!-- Metrics Grid (Left Column) -->
  <g transform="translate(100, 310)">
    <!-- Metric 1 -->
    <rect x="0" y="0" width="220" height="130" rx="16" fill="#1e293b" fill-opacity="0.6" stroke="#334155" stroke-opacity="0.5" />
    <text x="24" y="42" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="15" font-weight="500">Mention Rate</text>
    <text x="24" y="95" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="44" font-weight="800">${mentionRate}%</text>

    <!-- Metric 2 -->
    <rect x="250" y="0" width="220" height="130" rx="16" fill="#1e293b" fill-opacity="0.6" stroke="#334155" stroke-opacity="0.5" />
    <text x="274" y="42" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="15" font-weight="500">Avg Rec Position</text>
    <text x="274" y="95" fill="#38bdf8" font-family="system-ui, sans-serif" font-size="44" font-weight="800">#${avgPos || '2'}</text>

    <!-- Metric 3 -->
    <rect x="500" y="0" width="220" height="130" rx="16" fill="#1e293b" fill-opacity="0.6" stroke="#334155" stroke-opacity="0.5" />
    <text x="524" y="42" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="15" font-weight="500">Engines Tested</text>
    <text x="524" y="95" fill="#a78bfa" font-family="system-ui, sans-serif" font-size="44" font-weight="800">4 / 4</text>
  </g>

  <!-- Big Radial / Box Score Card (Right Column) -->
  <g transform="translate(860, 160)">
    <rect x="0" y="0" width="240" height="280" rx="24" fill="#0f172a" stroke="#10b981" stroke-width="2" stroke-opacity="0.6" />
    
    <text x="120" y="55" text-anchor="middle" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="14" font-weight="600" letter-spacing="1">AI VISIBILITY SCORE</text>
    <text x="120" y="155" text-anchor="middle" fill="#34d399" font-family="system-ui, sans-serif" font-size="82" font-weight="900" letter-spacing="-2">${score}</text>
    <text x="120" y="195" text-anchor="middle" fill="#64748b" font-family="system-ui, sans-serif" font-size="16">OUT OF 100</text>
    
    <!-- Rating Badge -->
    <rect x="25" y="222" width="190" height="34" rx="8" fill="#10b981" fill-opacity="0.2" />
    <text x="120" y="244" text-anchor="middle" fill="#10b981" font-family="system-ui, sans-serif" font-weight="700" font-size="13">${escapeXml(labelInfo.label)}</text>
  </g>

  <!-- Footer Banner -->
  <g transform="translate(100, 560)">
    <text x="0" y="0" fill="#64748b" font-family="system-ui, sans-serif" font-size="14">Engines: ChatGPT Search • Perplexity Sonar • Gemini Grounding • Google AI Overviews</text>
    <text x="1000" y="0" text-anchor="end" fill="#10b981" font-family="system-ui, sans-serif" font-size="14" font-weight="600">Scan your store at askrank.ai</text>
  </g>
</svg>
  `.trim();

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=43200'
    }
  });
}

function escapeXml(unsafe: string) {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}
