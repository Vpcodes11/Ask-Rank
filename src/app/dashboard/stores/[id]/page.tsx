import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { StoreActions } from '@/components/dashboard/forms';
import ContentFixer from '@/components/dashboard/ContentFixer';
import type { CompetitorStats, StoreSnapshot } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function StorePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser(`/dashboard/stores/${id}`);
  const store = await db.store.findFirst({ where: { id, userId: user.id } });
  if (!store) notFound();

  const [scans, fixes] = await Promise.all([
    db.scan.findMany({
      where: { storeId: store.id },
      orderBy: { createdAt: 'desc' },
      take: 26,
      select: { id: true, status: true, score: true, createdAt: true, competitors: true, storeData: true, error: true },
    }),
    db.contentFix.findMany({ where: { storeId: store.id }, orderBy: { createdAt: 'desc' }, take: 50 }),
  ]);
  const done = scans.filter((s) => s.status === 'done' && s.score !== null);
  const latest = done[0];
  const running = scans.find((s) => s.status === 'running');
  const snapshot = latest?.storeData as unknown as StoreSnapshot | undefined;
  const products = (snapshot?.products || []).map((p) => ({ handle: p.handle, title: p.title }));
  const comps = ((latest?.competitors as unknown as CompetitorStats[]) || []).slice(0, 6);
  const history = [...done].reverse();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <Link href="/dashboard" className="text-xs text-slate-400 hover:text-white">← Dashboard</Link>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">{store.name}</h1>
          <p className="text-xs text-slate-400 mt-1">
            {store.domain} · runs weekly, next on {store.nextRunAt.toLocaleDateString()}
          </p>
        </div>
        <StoreActions storeId={store.id} />
      </div>

      {running && (
        <Link href={`/scan/${running.id}`} className="block p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-sm">
          A scan is running now. Watch it →
        </Link>
      )}

      <section className="grid md:grid-cols-3 gap-4">
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="text-[11px] uppercase text-slate-400 font-semibold">Latest score</div>
          {latest ? (
            <>
              <div className="text-4xl font-black text-emerald-400 mt-1">{latest.score}<span className="text-sm text-slate-500">/100</span></div>
              <Link href={`/scan/${latest.id}`} className="text-xs text-emerald-400 hover:underline">Open full report →</Link>
            </>
          ) : (
            <div className="text-sm text-slate-400 mt-2">{running ? 'First scan in progress…' : 'No finished scan yet.'}</div>
          )}
        </div>
        <div className="md:col-span-2 p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="text-[11px] uppercase text-slate-400 font-semibold mb-3">Score history</div>
          {history.length >= 2 ? <ScoreChart points={history.map((s) => ({ score: s.score as number, date: s.createdAt }))} /> : <p className="text-xs text-slate-500">The chart appears after the second weekly run.</p>}
        </div>
      </section>

      {comps.length > 0 && (
        <section className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
          <h2 className="text-base font-bold text-white mb-3">Recommended instead of you (latest run)</h2>
          <div className="grid sm:grid-cols-2 gap-2 text-xs">
            {comps.map((c) => (
              <div key={c.name} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex justify-between">
                <span className="font-semibold text-slate-200">{c.name}</span>
                <span className="text-slate-400">{c.percentage}% of answers</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-lg font-bold text-white mb-1">Content Fixer</h2>
        <p className="text-xs text-slate-400 mb-4">Draft product copy that answers the questions shoppers ask AI.</p>
        <ContentFixer storeId={store.id} products={products} initialFixes={fixes.map((f) => ({ ...f, createdAt: f.createdAt.toISOString() }))} />
      </section>

      <section>
        <h2 className="text-lg font-bold text-white mb-3">All runs</h2>
        <div className="space-y-1.5">
          {scans.map((s) => (
            <Link key={s.id} href={`/scan/${s.id}`} className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 flex justify-between text-sm">
              <span className="text-slate-300">{s.createdAt.toLocaleString()}</span>
              <span className={s.status === 'failed' ? 'text-rose-400' : 'text-slate-200'}>{s.status === 'done' ? `${s.score}/100` : s.status}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function ScoreChart({ points }: { points: Array<{ score: number; date: Date }> }) {
  const w = 600;
  const h = 160;
  const pad = 24;
  const x = (i: number) => pad + (i * (w - pad * 2)) / Math.max(1, points.length - 1);
  const y = (v: number) => h - pad - (v / 100) * (h - pad * 2);
  const d = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.score).toFixed(1)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-40" role="img" aria-label="Score history">
      {[0, 50, 100].map((v) => (
        <g key={v}>
          <line x1={pad} x2={w - pad} y1={y(v)} y2={y(v)} stroke="#1e293b" />
          <text x={2} y={y(v) + 4} fontSize="10" fill="#64748b">{v}</text>
        </g>
      ))}
      <path d={d} fill="none" stroke="#34d399" strokeWidth="2.5" />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(p.score)} r="3.5" fill="#34d399" />
          <title>{`${p.date.toLocaleDateString()}: ${p.score}`}</title>
        </g>
      ))}
    </svg>
  );
}
