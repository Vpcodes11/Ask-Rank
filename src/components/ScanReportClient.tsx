'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, XCircle, ExternalLink, ChevronDown, ChevronUp, Lock, Mail, Download, Share2, AlertTriangle, Loader2, Copy } from 'lucide-react';
import ScoreGauge from '@/components/ScoreGauge';
import EngineBadge from '@/components/EngineBadge';
import DeepAuditPanel from '@/components/DeepAuditPanel';
import { formatPrice, type Currency } from '@/lib/plans';
import type { PromptRunResult, ScanView } from '@/lib/types';

export default function ScanReportClient({ initialScan, notice }: { initialScan: ScanView; notice?: string | null }) {
  const [scan, setScan] = useState<ScanView>(initialScan);
  const [expanded, setExpanded] = useState<string | null>(initialScan.prompts[0]?.id ?? null);

  // Poll while the scan is running.
  useEffect(() => {
    if (scan.status !== 'running') return;
    const t = setInterval(async () => {
      try {
        const res = await fetch(`/api/scan/${scan.id}`, { cache: 'no-store' });
        if (res.ok) setScan((await res.json()).scan);
      } catch {
        /* keep polling */
      }
    }, 3000);
    return () => clearInterval(t);
  }, [scan.status, scan.id]);

  if (scan.status === 'running') return <Running scan={scan} />;
  if (scan.status === 'failed') return <Failed scan={scan} />;

  const byPrompt = new Map<string, PromptRunResult[]>();
  for (const r of scan.results) byPrompt.set(r.prompt_id, [...(byPrompt.get(r.prompt_id) || []), r]);
  const locked = scan.prompts.filter((p) => !scan.visiblePromptIds.includes(p.id));
  const b = scan.breakdown;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {notice && <div className="mb-6 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm">{notice}</div>}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8 border-b border-slate-800">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-400">{scan.kind === 'monitor' ? 'Weekly run' : 'AI visibility scan'}</span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">{scan.storeName}</h1>
          <p className="text-xs text-slate-400 mt-1">
            <a href={scan.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-emerald-400">{scan.domain}</a>
            {scan.niche && <> · {scan.niche}</>} · {new Date(scan.finishedAt || scan.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ShareButton scan={scan} />
          <a href={`/api/export/pdf?scan_id=${scan.id}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold">
            <Download className="w-3.5 h-3.5 text-emerald-400" /> PDF
          </a>
        </div>
      </div>

      <section className="my-8 grid grid-cols-1 lg:grid-cols-12 gap-8 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8">
        <div className="lg:col-span-4 flex flex-col items-center justify-center">
          <ScoreGauge score={scan.score ?? 0} size="lg" />
        </div>
        <div className="lg:col-span-8 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Metric label="Named in answers" value={`${b?.mention_rate ?? 0}%`} hint="Answers that mention you" />
            <Metric label="Avg. rank" value={b?.avg_position ? `#${b.avg_position}` : '–'} hint="When you are named" />
            <Metric label="Engines naming you" value={`${b?.engine_diversity ?? 0}%`} hint="At least once" />
            <Metric label="Cite your site" value={`${b?.citation_rate ?? 0}%`} hint="Answers linking to you" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-slate-400">Asked live:</span>
            {scan.engines.map((e) => (
              <EngineBadge key={e} engine={e} />
            ))}
          </div>
          <p className="text-[11px] text-slate-500">
            Real answers from each engine&apos;s API with live web search. AI answers vary between runs and locations, so treat one scan as a snapshot.
          </p>
        </div>
      </section>

      <section className="my-10">
        <h2 className="text-xl font-black text-white">What shoppers asked, and what AI answered</h2>
        <p className="text-xs text-slate-400 mt-1 mb-6">
          {scan.prompts.length} buyer questions for your category.
          {locked.length > 0 && <span className="text-emerald-400"> Showing {scan.visiblePromptIds.length} free · {locked.length} locked</span>}
        </p>

        <div className="space-y-4">
          {scan.prompts
            .filter((p) => scan.visiblePromptIds.includes(p.id))
            .map((p, i) => {
              const rs = byPrompt.get(p.id) || [];
              const open = expanded === p.id;
              const named = rs.some((r) => r.mentioned);
              return (
                <div key={p.id} className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
                  <button onClick={() => setExpanded(open ? null : p.id)} className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left hover:bg-slate-800/40">
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-white">&ldquo;{p.query}&rdquo;</h3>
                        {p.intent && <p className="text-[11px] text-slate-500 mt-0.5">{p.intent}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {named ? (
                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Named
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <XCircle className="w-3.5 h-3.5" /> Not named
                        </span>
                      )}
                      {open ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                    </div>
                  </button>
                  {open && (
                    <div className="p-5 pt-0 border-t border-slate-800/60 bg-slate-950/40 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {rs.map((r) => (
                        <AnswerCard key={r.id} r={r} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
        </div>

        {locked.length > 0 && <UnlockBox scan={scan} locked={locked.map((p) => p.query)} onUnlocked={setScan} />}
      </section>

      <section className="my-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
          <h2 className="text-base font-bold text-white mb-4">Who AI recommends instead</h2>
          {scan.competitors.length === 0 && <p className="text-xs text-slate-400">No other brands were named.</p>}
          <div className="space-y-2">
            {scan.competitors.map((c) => (
              <div key={c.name} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">{c.name}</span>
                <span className="text-[11px] text-slate-400">
                  {c.percentage}% of answers{c.avgPosition ? ` · avg #${c.avgPosition}` : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
          <h2 className="text-base font-bold text-white mb-4">Sites the AI answers relied on</h2>
          {scan.sources.length === 0 && <p className="text-xs text-slate-400">No sources were cited.</p>}
          <div className="space-y-2">
            {scan.sources.map((s) => (
              <a key={s.domain} href={s.url} target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between hover:border-slate-700">
                <span className="min-w-0">
                  <span className="block text-xs font-bold text-slate-200 truncate">{s.domain}</span>
                  <span className="text-[10px] text-slate-500">{s.tier}</span>
                </span>
                <span className="text-[11px] text-emerald-400 shrink-0">cited {s.frequency}×</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section id="deep-audit" className="my-12 scroll-mt-24">
        {scan.deepAccess ? <DeepAuditPanel scanId={scan.id} /> : <BuyDeepAudit scan={scan} />}
      </section>

      {scan.kind === 'free' && (
        <section className="my-10 p-8 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-black text-white">Track this every week</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Weekly Monitor re-asks 20 buyer questions on every engine each week, shows how your score and competitors move, and drafts product content fixes from your real catalog.
            </p>
          </div>
          <Link href="/pricing" className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shrink-0">
            See plans
          </Link>
        </section>
      )}
    </div>
  );
}

function Metric({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
      <span className="text-[10px] text-slate-400 uppercase font-semibold">{label}</span>
      <div className="text-xl font-black text-white mt-1">{value}</div>
      <span className="text-[10px] text-slate-500">{hint}</span>
    </div>
  );
}

function AnswerCard({ r }: { r: PromptRunResult }) {
  const [full, setFull] = useState(false);
  return (
    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-2 mt-4">
      <div className="flex items-center justify-between">
        <EngineBadge engine={r.engine} size="sm" />
        <span className={`text-[11px] font-bold ${r.error ? 'text-slate-500' : r.mentioned ? 'text-emerald-400' : 'text-slate-400'}`}>
          {r.error ? 'No answer' : r.mentioned ? (r.position ? `Ranked #${r.position}` : 'Mentioned') : 'Not named'}
        </span>
      </div>
      {r.error ? (
        <p className="text-xs text-slate-500">{r.error}</p>
      ) : (
        <>
          <p className={`text-xs text-slate-300 whitespace-pre-wrap leading-relaxed bg-slate-950 p-2.5 rounded-lg border border-slate-800/60 ${full ? '' : 'line-clamp-6'}`}>
            <AnswerText text={r.raw_response} />
          </p>
          <button onClick={() => setFull(!full)} className="self-start text-[11px] text-emerald-400 hover:underline">
            {full ? 'Show less' : 'Read full answer'}
          </button>
          {r.competitors.length > 0 && (
            <p className="text-[11px]">
              <span className="text-slate-500">Recommended: </span>
              <span className="text-slate-300">{r.competitors.slice(0, 5).map((c) => c.name).join(', ')}</span>
            </p>
          )}
          {r.sources.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {r.sources.slice(0, 6).map((s) => (
                <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] flex items-center gap-1">
                  {s.domain} <ExternalLink className="w-2.5 h-2.5" />
                </a>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/** Renders **bold** and drops other light markdown (headings, link syntax, citation markers). */
function AnswerText({ text }: { text: string }) {
  const clean = text
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, '$1')
    .replace(/\[\d+\]/g, '')
    .replace(/(^|\s)\*(?!\*)([^*\n]+)\*(?!\*)/g, '$1$2');
  const parts = clean.split(/\*\*([^*]+)\*\*/g);
  return <>{parts.map((p, i) => (i % 2 ? <strong key={i} className="text-white">{p}</strong> : p))}</>;
}

function UnlockBox({ scan, locked, onUnlocked }: { scan: ScanView; locked: string[]; onUnlocked: (s: ScanView) => void }) {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/scan/${scan.id}/unlock`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not unlock');
      onUnlocked(data.scan);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="relative mt-6 rounded-3xl border border-slate-800 overflow-hidden p-6 bg-slate-900/40">
      <div className="blur-sm select-none opacity-40 space-y-3 pointer-events-none" aria-hidden>
        {locked.map((q) => (
          <div key={q} className="p-4 rounded-xl bg-slate-800/50 text-sm font-bold text-white">&ldquo;{q}&rdquo;</div>
        ))}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/75 p-6 text-center">
        <Lock className="w-6 h-6 text-emerald-400 mb-2" />
        <h3 className="text-lg font-black text-white">{locked.length} more answers</h3>
        <p className="text-xs text-slate-400 max-w-md mt-1 mb-4">Enter your email to see every question, every engine&apos;s full answer, and which competitors won each one. Free.</p>
        <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2 w-full max-w-md">
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@yourstore.com" className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm focus:outline-none focus:border-emerald-500" />
          <button disabled={busy} className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-60">
            <Mail className="w-4 h-4" /> {busy ? 'Unlocking…' : 'Show all answers'}
          </button>
        </form>
        {error && <p className="text-xs text-rose-400 mt-2">{error}</p>}
        <p className="text-[10px] text-slate-500 mt-2">We may email you about your results. Unsubscribe any time.</p>
      </div>
    </div>
  );
}

function BuyDeepAudit({ scan }: { scan: ScanView }) {
  const [currency, setCurrency] = useState<Currency>('USD');
  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 grid md:grid-cols-2 gap-6 items-center">
      <div>
        <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-400">Deep Audit</span>
        <h2 className="text-xl font-black text-white mt-1">Find out why AI skips {scan.storeName}</h2>
        <ul className="text-xs text-slate-300 mt-3 space-y-1.5 list-disc pl-4">
          <li>Structured data check of up to 10 product pages, including review markup</li>
          <li>Content gaps per product: specs, materials, sizing, who it is for</li>
          <li>The sites AI cites for your competitors: your outreach list</li>
          <li>Ready-to-paste llms.txt and Product JSON-LD</li>
          <li>All answers unlocked, plus a printable PDF</li>
        </ul>
      </div>
      <form action="/api/billing/checkout" method="post" className="flex flex-col items-start md:items-end gap-3">
        <input type="hidden" name="product" value="report" />
        <input type="hidden" name="scan_id" value={scan.id} />
        <input type="hidden" name="currency" value={currency} />
        <div className="flex gap-1 text-[11px]">
          {(['USD', 'INR'] as const).map((c) => (
            <button type="button" key={c} onClick={() => setCurrency(c)} className={`px-2.5 py-1 rounded-full border ${currency === c ? 'bg-emerald-500 text-slate-950 border-emerald-500' : 'border-slate-700 text-slate-300'}`}>
              {c}
            </button>
          ))}
        </div>
        <div className="text-3xl font-black text-white">
          {formatPrice('report', currency)} <span className="text-xs font-medium text-slate-400">one-time</span>
        </div>
        <button className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-bold">Get the Deep Audit</button>
      </form>
    </div>
  );
}

function ShareButton({ scan }: { scan: ScanView }) {
  const [copied, setCopied] = useState(false);
  const share = async () => {
    const url = `${window.location.origin}/scan/${scan.id}`;
    const text = `${scan.storeName} scored ${scan.score}/100 for AI visibility. Does ChatGPT recommend your store?`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'AskRank', text, url });
        return;
      } catch {
        /* fall through to copy */
      }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={share} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold">
      {copied ? <Copy className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-emerald-400" />}
      {copied ? 'Link copied' : 'Share'}
    </button>
  );
}

function Running({ scan }: { scan: ScanView }) {
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <Loader2 className="w-10 h-10 text-emerald-400 animate-spin mx-auto" />
      <h1 className="text-2xl font-black text-white mt-6">Scanning {scan.domain}</h1>
      <p className="text-sm text-slate-300 mt-3">{scan.progress || 'Starting…'}</p>
      <p className="text-xs text-slate-500 mt-6">We ask each AI engine real buyer questions with live web search. This usually takes 1–2 minutes. You can keep this page open.</p>
    </div>
  );
}

function Failed({ scan }: { scan: ScanView }) {
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
      <h1 className="text-2xl font-black text-white mt-6">We couldn&apos;t finish scanning {scan.domain}</h1>
      <p className="text-sm text-slate-300 mt-3">{scan.error || 'Something went wrong.'}</p>
      <Link href="/#scan" className="inline-block mt-8 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold">
        Try again
      </Link>
    </div>
  );
}
