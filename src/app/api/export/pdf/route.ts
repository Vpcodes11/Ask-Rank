import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUser } from '@/lib/auth';
import { toScanView } from '@/lib/scan-view';
import { getOrBuildDeepAudit } from '@/lib/deep-audit';
import { getScoreLabel } from '@/lib/scoring';
import { ENGINE_NAMES } from '@/lib/engines';
import { esc } from '@/lib/email';
import type { DeepAudit } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

/**
 * Print-ready report (the browser's "Save as PDF" makes the file).
 * Shows only what the viewer may see. Agency subscribers get their own name on it.
 */
export async function GET(req: NextRequest) {
  const scanId = new URL(req.url).searchParams.get('scan_id') || '';
  const scan = await db.scan.findUnique({ where: { id: scanId } });
  if (!scan || scan.status !== 'done') return new NextResponse('Report not found', { status: 404 });
  const user = await getUser();
  const v = await toScanView(scan, user);
  const audit: DeepAudit | null = v.deepAccess ? await getOrBuildDeepAudit(scan) : null;
  const brand = user?.plan === 'agency' && user.agencyName && v.deepAccess ? user.agencyName : 'AskRank';
  const label = getScoreLabel(v.score ?? 0);
  const engines = v.engines.map((e) => ENGINE_NAMES[e]).join(', ');
  const date = new Date(v.finishedAt || v.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  const promptRows = v.prompts
    .map((p, i) => {
      const rs = v.results.filter((r) => r.prompt_id === p.id);
      if (!v.visiblePromptIds.includes(p.id)) return `<tr><td>${i + 1}</td><td>${esc(p.query)}</td><td colspan="2" class="muted">Locked</td></tr>`;
      const named = rs.filter((r) => r.mentioned).map((r) => `${ENGINE_NAMES[r.engine]}${r.position ? ` #${r.position}` : ''}`).join(', ') || '<span class="bad">Not named</span>';
      const comps = [...new Set(rs.flatMap((r) => r.competitors.slice(0, 3).map((c) => c.name)))].slice(0, 4).join(', ');
      return `<tr><td>${i + 1}</td><td>${esc(p.query)}</td><td>${named}</td><td>${esc(comps)}</td></tr>`;
    })
    .join('');

  const auditHtml = audit
    ? `<h2>Deep Audit</h2>
<h3>What to fix first</h3><ul>${audit.recommendations.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>
<h3>Product pages</h3>
<table><tr><th>Product</th><th>Gap score</th><th>Issues</th></tr>${audit.products
        .map((p) => `<tr><td>${esc(p.title)}</td><td>${p.fetched ? p.gapScore : '–'}</td><td>${p.fetched ? esc(p.gaps.join(' · ')) : 'Page could not be loaded'}</td></tr>`)
        .join('')}</table>
<h3>Sites AI cites for competitors</h3>
<table><tr><th>Site</th><th>Times cited</th><th>Competitors named</th></tr>${audit.citationTargets
        .map((t) => `<tr><td>${esc(t.domain)}</td><td>${t.count}</td><td>${esc(t.competitorsNamed.join(', '))}</td></tr>`)
        .join('')}</table>`
    : '';

  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>AI Visibility Report – ${esc(v.storeName)}</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
@page{size:A4;margin:16mm}body{font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0f172a;max-width:900px;margin:0 auto;padding:24px;line-height:1.45;font-size:13px}
h1{font-size:24px;margin:4px 0}h2{font-size:18px;margin:28px 0 8px;border-bottom:2px solid #0f172a;padding-bottom:4px}h3{font-size:14px;margin:18px 0 6px}
.top{display:flex;justify-content:space-between;align-items:flex-start;gap:16px}.brand{font-weight:800;color:#059669;letter-spacing:1px;text-transform:uppercase;font-size:12px}
.score{border:2px solid #059669;border-radius:12px;padding:12px 20px;text-align:center}.score b{font-size:44px;display:block;color:#059669;line-height:1}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:16px}.grid div{border:1px solid #e2e8f0;border-radius:8px;padding:8px}.grid b{font-size:18px;display:block}
table{width:100%;border-collapse:collapse;margin-top:6px}th,td{border:1px solid #e2e8f0;padding:6px;text-align:left;vertical-align:top}th{background:#f8fafc}
.muted{color:#94a3b8}.bad{color:#e11d48}.noprint{margin-bottom:16px}@media print{.noprint{display:none}}
</style></head><body>
<div class="noprint"><button onclick="window.print()">Save as PDF / Print</button></div>
<div class="top"><div><div class="brand">${esc(brand)} · AI visibility report</div><h1>${esc(v.storeName)}</h1>
<div class="muted">${esc(v.domain)} · ${esc(v.niche)} · ${esc(date)}</div><div class="muted">Engines: ${esc(engines)}</div></div>
<div class="score">AI Visibility<b>${v.score}</b>/100<br>${esc(label.label)}</div></div>
<div class="grid"><div>Named in answers<b>${v.breakdown?.mention_rate ?? 0}%</b></div><div>Avg. rank when named<b>${v.breakdown?.avg_position ? `#${v.breakdown.avg_position}` : '–'}</b></div>
<div>Engines naming you<b>${v.breakdown?.engine_diversity ?? 0}%</b></div><div>Answers citing your site<b>${v.breakdown?.citation_rate ?? 0}%</b></div></div>
<h2>Buyer questions</h2><table><tr><th>#</th><th>Question</th><th>Named by</th><th>Recommended instead</th></tr>${promptRows}</table>
<h2>Who AI recommends instead</h2><table><tr><th>Brand</th><th>Share of answers</th><th>Avg. rank</th></tr>${v.competitors
    .map((c) => `<tr><td>${esc(c.name)}</td><td>${c.percentage}%</td><td>${c.avgPosition ? `#${c.avgPosition}` : '–'}</td></tr>`)
    .join('')}</table>
${auditHtml}
<p class="muted" style="margin-top:24px">Answers come from live API calls to each engine on the date above. AI answers change over time and can differ between users and locations.</p>
</body></html>`;
  return new NextResponse(html, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
}
