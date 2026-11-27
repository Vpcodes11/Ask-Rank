import { ImageResponse } from 'next/og';
import { db } from '@/lib/db';
import { getScoreLabel } from '@/lib/scoring';
import { ENGINE_NAMES } from '@/lib/engines';
import type { EngineId, ScanBreakdown } from '@/lib/types';

export const dynamic = 'force-dynamic';

/** 1200x630 PNG share card for a finished scan. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const scan = await db.scan.findUnique({
    where: { id },
    select: { storeName: true, domain: true, score: true, breakdown: true, engines: true, status: true },
  });
  if (!scan || scan.status !== 'done' || scan.score === null) return new Response('Not found', { status: 404 });

  const b = scan.breakdown as unknown as ScanBreakdown;
  const label = getScoreLabel(scan.score).label;
  const engines = ((scan.engines as unknown as EngineId[]) || []).map((e) => ENGINE_NAMES[e]).join(' · ');
  const color = scan.score >= 70 ? '#34d399' : scan.score >= 45 ? '#2dd4bf' : scan.score >= 20 ? '#fbbf24' : '#fb7185';

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#0a0f1d', color: '#f8fafc', padding: 72, fontFamily: 'sans-serif' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 24, color: '#34d399', fontWeight: 700 }}>
          ASKRANK <span style={{ color: '#94a3b8', fontWeight: 400 }}>AI visibility check</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 680 }}>
            <div style={{ fontSize: 60, fontWeight: 800, lineHeight: 1.1 }}>{scan.storeName.slice(0, 40)}</div>
            <div style={{ fontSize: 28, color: '#94a3b8', marginTop: 12 }}>{scan.domain}</div>
            <div style={{ display: 'flex', gap: 40, marginTop: 40, fontSize: 26, color: '#cbd5e1' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 18, color: '#64748b' }}>Named in answers</span>
                <span style={{ fontSize: 44, fontWeight: 800 }}>{b?.mention_rate ?? 0}%</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 18, color: '#64748b' }}>Avg. rank when named</span>
                <span style={{ fontSize: 44, fontWeight: 800 }}>{b?.avg_position ? `#${b.avg_position}` : '–'}</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', border: `3px solid ${color}`, borderRadius: 32, padding: '28px 48px' }}>
            <span style={{ fontSize: 18, color: '#94a3b8', letterSpacing: 2 }}>AI VISIBILITY</span>
            <span style={{ fontSize: 120, fontWeight: 900, color, lineHeight: 1 }}>{scan.score}</span>
            <span style={{ fontSize: 20, color: '#94a3b8' }}>out of 100</span>
            <span style={{ fontSize: 20, color, marginTop: 12, fontWeight: 700 }}>{label}</span>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 20, color: '#64748b' }}>
          <span>Tested on {engines}</span>
          <span style={{ color: '#34d399' }}>Check your store free</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630, headers: { 'Cache-Control': 'public, max-age=3600' } },
  );
}
